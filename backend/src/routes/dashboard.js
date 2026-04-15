const { authenticate } = require('../middleware/auth')

async function dashboardRoutes(fastify) {
  /**
   * GET /api/dashboard
   * Returns KPI stats, active tables, recent orders for today.
   * Requires auth.
   */
  fastify.get('/api/dashboard', { preHandler: authenticate }, async (request) => {
    const { tenantId } = request.user

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [
      activeSessions,
      allTables,
      activeOrders,
      recentOrders,
      todayPayments,
    ] = await Promise.all([
      // Aktif masalar (session açık olanlar)
      fastify.prisma.tableSession.findMany({
        where: { tenantId, status: 'ACTIVE' },
        include: {
          table: { select: { number: true, label: true, capacity: true } },
          orders: {
            where: { status: { notIn: ['CANCELLED'] } },
            include: { items: true },
          },
        },
      }),

      // Toplam masa sayısı
      fastify.prisma.table.count({ where: { tenantId } }),

      // Aktif sipariş sayısı (bugün, iptal edilmemiş, servis edilmemiş)
      fastify.prisma.order.count({
        where: {
          tenantId,
          status: { in: ['PENDING_APPROVAL', 'APPROVED'] },
          createdAt: { gte: todayStart },
        },
      }),

      // Son 10 sipariş
      fastify.prisma.order.findMany({
        where: { tenantId, createdAt: { gte: todayStart } },
        include: {
          items: true,
          session: {
            include: { table: { select: { number: true, label: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Bugünkü ödemeler (günlük ciro)
      fastify.prisma.payment.findMany({
        where: {
          tenantId,
          paidAt: { gte: todayStart },
        },
        select: { amount: true },
      }),
    ])

    // Aktif masaları formatla
    const tables = activeSessions.map((s) => {
      const total = s.orders.reduce((sum, o) => {
        return sum + o.items.reduce((s2, i) => s2 + i.price * i.quantity, 0)
      }, 0)

      const pendingApproval = s.orders.some((o) => o.status === 'PENDING_APPROVAL')
      const hasOrders = s.orders.length > 0

      let status = 'OPEN'
      if (pendingApproval) status = 'WAITING'

      return {
        id: s.id,
        tableId: s.tableId,
        number: s.table.number,
        label: s.table.label,
        guestName: s.guestName,
        guestCount: s.guestCount || 0,
        total,
        status,
        openedAt: s.openedAt,
      }
    })

    // Günlük ciro
    const dailyRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0)

    // Toplam misafir sayısı
    const totalGuests = activeSessions.reduce((sum, s) => sum + (s.guestCount || 0), 0)

    // Son siparişleri formatla
    const orders = recentOrders.map((o) => {
      const firstItem = o.items[0]
      const itemLabel = o.items.length > 1
        ? `${firstItem?.name} +${o.items.length - 1}`
        : firstItem?.name || 'Sipariş'

      return {
        id: o.id,
        item: itemLabel,
        tableNumber: o.session?.table?.number,
        tableLabel: o.session?.table?.label,
        status: o.status,
        createdAt: o.createdAt,
      }
    })

    return {
      stats: {
        occupiedTables: activeSessions.length,
        totalTables: allTables,
        activeOrders,
        dailyRevenue,
        totalGuests,
      },
      activeTables: tables,
      recentOrders: orders,
    }
  })
}

module.exports = dashboardRoutes

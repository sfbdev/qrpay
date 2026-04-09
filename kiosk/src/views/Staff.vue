<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Staff</h1>
        <p class="page-subtitle">Manage team members and roles</p>
      </div>
      <button class="btn btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Staff
      </button>
    </div>

    <div class="page-body">
      <div class="table-wrap card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in staff" :key="s.id">
              <td>
                <div class="user-cell">
                  <div :class="['user-avatar', 'avatar-' + s.role]">
                    {{ s.name.split(' ').map(n => n[0]).join('') }}
                  </div>
                  <span class="user-name">{{ s.name }}</span>
                </div>
              </td>
              <td class="cell-muted">{{ s.email }}</td>
              <td>
                <span :class="['badge', roleBadge(s.role)]">{{ roleLabel(s.role) }}</span>
              </td>
              <td class="cell-muted">{{ s.lastLogin }}</td>
              <td>
                <button class="btn btn-secondary btn-sm">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const staff = [
  { id: 1, name: 'Furkan Bayram', email: 'furkan@freyacafe.com', role: 'admin', lastLogin: 'Today 09:15' },
  { id: 2, name: 'Tonk Ekkasit', email: 'tonk@freyacafe.com', role: 'cashier', lastLogin: 'Today 10:30' },
  { id: 3, name: 'Freya Ekkasit', email: 'freya@freyacafe.com', role: 'waiter', lastLogin: 'Yesterday 18:45' },
  { id: 4, name: 'Sedef Ekkasit', email: 'sedef@freyacafe.com', role: 'waiter', lastLogin: 'Today 11:00' },
]

function roleLabel(r) {
  return { admin: 'Admin', cashier: 'Cashier', waiter: 'Waiter' }[r] || r
}

function roleBadge(r) {
  return { admin: 'badge-purple', cashier: 'badge-blue', waiter: 'badge-green' }[r] || 'badge-gray'
}
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.page-header {
  padding: 32px 40px 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 13px;
  color: var(--text-3);
  margin-top: 4px;
}

.page-body {
  padding: 28px 40px 40px;
  flex: 1;
  overflow-y: auto;
}

.table-wrap {
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 14px 20px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}

.data-table td {
  padding: 16px 20px;
  font-size: 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr {
  transition: background var(--transition);
}

.data-table tbody tr:hover {
  background: var(--surface-2);
}

.cell-muted {
  color: var(--text-2);
  font-size: 13px;
}

/* User cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.avatar-admin { background: linear-gradient(135deg, #7C3AED, #A78BFA); }
.avatar-cashier { background: linear-gradient(135deg, #4F46E5, #818CF8); }
.avatar-waiter { background: linear-gradient(135deg, #059669, #34D399); }

.user-name {
  font-weight: 600;
  color: var(--text-1);
  font-size: 14px;
}
</style>

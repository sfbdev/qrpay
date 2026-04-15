import { toast } from 'vue3-toastify'

const baseOptions = {
  autoClose: 2500,
  position: toast.POSITION.TOP_RIGHT,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  transition: 'slide',
}

export function toastSuccess(message) {
  toast.success(message, baseOptions)
}

export function toastError(message) {
  toast.error(message, { ...baseOptions, autoClose: 4000 })
}

export function toastInfo(message) {
  toast.info(message, baseOptions)
}

export function toastWarning(message) {
  toast.warning(message, baseOptions)
}

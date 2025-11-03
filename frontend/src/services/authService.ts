import axios from 'axios'

interface LoginRequest {
  username: string
  password: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
}

interface LoginResponse {
  token: string
  userId: number
  username: string
  role: string
}

const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post('/auth/login', credentials)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<void> => {
    await axios.post('/auth/register', data)
  },
}

export default authService

import NextAuth from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

// 防止在构建时预渲染这个 API 路由
export const runtime = 'nodejs'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
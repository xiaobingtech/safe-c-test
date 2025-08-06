import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // 动态导入数据库，避免构建时初始化
        const { db } = await import('./db')
        
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const user = await db.user.findUnique({
            where: {
              username: credentials.username
            }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            username: user.username,
          }
        } catch (error) {
          console.error('Database error during authentication:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.username = token.username as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  // 确保 NextAuth 不会在构建时初始化数据库连接
  secret: process.env.NEXTAUTH_SECRET,
}
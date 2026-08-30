import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email }).select("+password");

        if (!user || !user.password) {
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
          firstName: user.firstName,
          username: user.username,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.firstName = user.firstName;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.firstName = token.firstName as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});

declare module "next-auth" {
  interface User {
    firstName?: string;
    username?: string;
  }
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      firstName?: string;
      username?: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    firstName?: string;
    username?: string;
  }
}

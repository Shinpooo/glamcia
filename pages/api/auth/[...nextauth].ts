import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user }) {
      // Liste des emails autorisés - séparés par des virgules dans la variable d'environnement
      const allowedEmailsEnv = process.env.ALLOWED_EMAILS || process.env.ALLOWED_EMAIL || 'your-email@gmail.com';
      const allowedEmails = allowedEmailsEnv.split(',').map(email => email.trim().toLowerCase());
      
      // Vérifier si l'email de l'utilisateur est dans la liste autorisée
      if (user.email && allowedEmails.includes(user.email.toLowerCase())) {
        return true;
      }
      
      // Log pour debug (optionnel - à retirer en production)
      console.log(`Access denied for email: ${user.email}`);
      console.log(`Allowed emails: ${allowedEmails.join(', ')}`);
      
      // Rejeter la connexion si l'email n'est pas autorisé
      return false;
    },
    async session({ session }) {
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
};

export default NextAuth(authOptions); 
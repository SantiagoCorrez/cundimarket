-- Inicio de sesión con Google: identificador de la cuenta de Google del usuario.
ALTER TABLE "User" ADD COLUMN "googleId" TEXT;
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

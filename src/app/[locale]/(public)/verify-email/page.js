import StaticInfoPage from '@/components/StaticInfoPage';

export default function VerifyEmailPage() {
  return (
    <StaticInfoPage
      title="Verification e-mail"
      description="Votre e-mail doit etre confirme pour activer completement votre compte."
      primaryLabel="Connexion"
      primaryHref="/login"
      secondaryLabel="Renvoyer l'e-mail"
      secondaryHref="/password-reset"
    />
  );
}

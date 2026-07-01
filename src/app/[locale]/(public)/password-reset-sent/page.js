import StaticInfoPage from '@/components/StaticInfoPage';

export default function PasswordResetSentPage() {
  return (
    <StaticInfoPage
      title="Lien envoye"
      description="Un e-mail de reinitialisation a ete envoye. Verifiez votre boite de reception et le dossier spam."
      primaryLabel="Retour connexion"
      primaryHref="/login"
      secondaryLabel="Renvoyer"
      secondaryHref="/password-reset"
    />
  );
}

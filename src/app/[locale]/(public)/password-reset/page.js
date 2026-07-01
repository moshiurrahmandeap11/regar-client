import StaticInfoPage from '@/components/StaticInfoPage';

export default function PasswordResetPage() {
  return (
    <StaticInfoPage
      title="Mot de passe oublie"
      description="Entrez votre e-mail dans la page connexion pour recevoir un lien de reinitialisation."
      primaryLabel="Retour connexion"
      primaryHref="/login"
      secondaryLabel="Aide"
      secondaryHref="/contact"
    />
  );
}

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPublicPortfolioData } from '@/lib/domains/public-portfolio';
import PortfolioClient from './PortfolioClient';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicPortfolioData(username);

  if (!data) return { title: 'User Not Found' };

  const fullName = `${data.user.firstName} ${data.user.lastName}`;
  const headline = data.profile?.headline || 'Portfolio';

  return {
    title: `${fullName} | ${headline}`,
    description: data.profile?.bio?.substring(0, 160) || `Check out ${fullName}'s portfolio`,
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { username } = await params;
  const data = await getPublicPortfolioData(username);

  if (!data) {
    notFound();
  }

  return <PortfolioClient data={data} />;
}

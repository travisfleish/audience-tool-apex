import { Audience } from '../lib/supabase';
import type { AudienceDomainSelection } from '../core/audienceDomain';
import { AudienceCard } from './AudienceCard';
import { getDisplayName } from '../utils/audienceDisplay';
import { resolveFeaturedPopularAudiences } from './PopularAudiences';
import { MobileAudienceCarousel } from './MobileAudienceCarousel';

interface FeaturedAudiencesProps {
  audiences: Audience[];
  allAudiences: Audience[];
  onAddToNotebook: (audience: Audience) => void;
  dealAudienceId?: string | null;
  audienceDealSlotTaken?: boolean;
  audienceDomain?: AudienceDomainSelection;
}

export function FeaturedAudiences({
  audiences: _audiences,
  allAudiences,
  onAddToNotebook,
  dealAudienceId = null,
  audienceDealSlotTaken = false,
  audienceDomain = null,
}: FeaturedAudiencesProps) {
  const featuredAudiences = resolveFeaturedPopularAudiences(allAudiences, audienceDomain);

  if (featuredAudiences.length === 0) return null;

  const renderFeaturedCard = (audience: Audience, index: number) => (
    <AudienceCard
      key={audience.id}
      audience={audience}
      onAddToNotebook={onAddToNotebook}
      isInNotebook={dealAudienceId === audience.id}
      audienceDealSlotTaken={audienceDealSlotTaken}
      isTopPerformer={index === 0}
      displayName={getDisplayName(audience, allAudiences)}
    />
  );

  return (
    <section className="page-section-gap">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gs-primary-900">Most Popular Audiences</h2>
      </div>

      <MobileAudienceCarousel
        items={featuredAudiences}
        renderItem={renderFeaturedCard}
        ariaLabel="Most popular audiences"
      />
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredAudiences.map(renderFeaturedCard)}
      </div>
    </section>
  );
}

import FaceLayout from "@/components/FaceLayout";
import CommunityWall from "@/components/CommunityWall";

// Each row represents a community with 4 regular photos, 1 wide cover photo, and an artifact
const COMMUNITY_ROWS = [
  {
    id: "socratica",
    artifactPosition: 5,
    artifact: {
      src: "/community-artifacts/socratica-svg.svg",
      hoverSrc: "/community-artifacts/socratica-svg-hover.svg",
      alt: "Croissant",
      offsetY: 24,
    },
    photos: [
      { src: "/photos/placeholder.jpg", alt: "Community event", rotation: -3 },
      { src: "/photos/placeholder.jpg", alt: "Group photo", rotation: 2 },
      { src: "/photos/placeholder.jpg", alt: "Demo day", rotation: -1 },
      { src: "/photos/placeholder.jpg", alt: "Outdoor event", rotation: 4 },
    ],
    cover: { src: "/photos/placeholder.jpg", alt: "Socratica cover", rotation: 1 },
  },
  {
    id: "go-outside",
    artifactPosition: 1,
    artifact: {
      src: "/community-artifacts/go-outside-svg.svg",
      hoverSrc: "/community-artifacts/go-outside-svg-hover.svg",
      alt: "Trophy",
      size: 185,
    },
    photos: [
      { src: "/photos/placeholder.jpg", alt: "Outside event", rotation: 2 },
      { src: "/photos/placeholder.jpg", alt: "Nature", rotation: -2 },
      { src: "/photos/placeholder.jpg", alt: "Group", rotation: 4 },
      { src: "/photos/placeholder.jpg", alt: "Adventure", rotation: -1 },
    ],
    cover: { src: "/photos/placeholder.jpg", alt: "Go Outside cover", rotation: 1 },
  },
  {
    id: "symposium",
    artifactPosition: 3,
    artifact: {
      src: "/community-artifacts/symposium-svg.svg",
      hoverSrc: "/community-artifacts/symposium-svg-hover.svg",
      alt: "Hockey jersey",
      size: 185,
      offsetY: 24,
    },
    photos: [
      { src: "/photos/placeholder.jpg", alt: "Symposium", rotation: 2 },
      { src: "/photos/placeholder.jpg", alt: "Stage", rotation: -3 },
      { src: "/photos/placeholder.jpg", alt: "Crowd", rotation: 1 },
      { src: "/photos/placeholder.jpg", alt: "Demo", rotation: -2 },
    ],
    cover: { src: "/photos/placeholder.jpg", alt: "Symposium cover", rotation: -1 },
  },
  {
    id: "hotgxrl",
    artifactPosition: 6,
    artifact: {
      src: "/community-artifacts/hotgxrl-svg.svg",
      hoverSrc: "/community-artifacts/hotgxrl-svg-hover.svg",
      alt: "Ice cream cone",
      size: 185,
      offsetY: -15,
    },
    photos: [
      { src: "/photos/placeholder.jpg", alt: "Walk club", rotation: -2 },
      { src: "/photos/placeholder.jpg", alt: "Group walk", rotation: 3 },
      { src: "/photos/placeholder.jpg", alt: "Event photo", rotation: -4 },
      { src: "/photos/placeholder.jpg", alt: "Community", rotation: 1 },
    ],
    cover: { src: "/photos/placeholder.jpg", alt: "Hot Gxrl cover", rotation: 2 },
  },
  {
    id: "silly-songs",
    artifactPosition: 2,
    artifact: {
      src: "/community-artifacts/silly-songs-svg.svg",
      hoverSrc: "/community-artifacts/silly-songs-svg-hover.svg",
      alt: "Guitar",
      size: 270,
      offsetY: -40,
    },
    photos: [
      { src: "/photos/placeholder.jpg", alt: "Music night", rotation: 2 },
      { src: "/photos/placeholder.jpg", alt: "Performance", rotation: -2 },
      { src: "/photos/placeholder.jpg", alt: "Jam session", rotation: 4 },
      { src: "/photos/placeholder.jpg", alt: "Singing", rotation: -3 },
    ],
    cover: { src: "/photos/placeholder.jpg", alt: "Silly Songs cover", rotation: 1 },
  },
  {
    id: "kickoff",
    artifactPosition: 4,
    artifact: {
      src: "/community-artifacts/kickoff-svg.svg",
      hoverSrc: "/community-artifacts/kickoff-svg-hover.svg",
      alt: "Traffic cone",
      size: 180,
      offsetY: 20,
    },
    photos: [
      { src: "/photos/placeholder.jpg", alt: "Friends", rotation: -1 },
      { src: "/photos/placeholder.jpg", alt: "Team", rotation: 3 },
      { src: "/photos/placeholder.jpg", alt: "Kickoff event", rotation: -4 },
      { src: "/photos/placeholder.jpg", alt: "Group", rotation: 2 },
    ],
    cover: { src: "/photos/placeholder.jpg", alt: "Kickoff cover", rotation: -2 },
  },
  {
    id: "syde",
    artifactPosition: 1,
    artifact: {
      src: "/community-artifacts/syde-svg.svg",
      hoverSrc: "/community-artifacts/syde-svg-hover.svg",
      alt: "Sharpie",
    },
    photos: [
      { src: "/photos/placeholder.jpg", alt: "SYDE event", rotation: -1 },
      { src: "/photos/placeholder.jpg", alt: "Classmates", rotation: 3 },
      { src: "/photos/placeholder.jpg", alt: "Project", rotation: -3 },
      { src: "/photos/placeholder.jpg", alt: "Studio", rotation: 2 },
    ],
    cover: { src: "/photos/placeholder.jpg", alt: "SYDE cover", rotation: -2 },
  },
  {
    id: "deca",
    artifactPosition: 5,
    artifact: {
      src: "/community-artifacts/deca-svg.svg",
      hoverSrc: "/community-artifacts/deca-svg-hover.svg",
      alt: "Mug",
      size: 180,
      offsetY: 50,
    },
    photos: [
      { src: "/photos/placeholder.jpg", alt: "Competition", rotation: 2 },
      { src: "/photos/placeholder.jpg", alt: "Team", rotation: -2 },
      { src: "/photos/placeholder.jpg", alt: "Awards", rotation: 1 },
      { src: "/photos/placeholder.jpg", alt: "Presentation", rotation: -3 },
    ],
    cover: { src: "/photos/placeholder.jpg", alt: "DECA cover", rotation: 3 },
  },
  {
    id: "beta-camp",
    artifactPosition: 3,
    artifact: {
      src: "/community-artifacts/beta-camp-svg.svg",
      hoverSrc: "/community-artifacts/beta-camp-svg-hover.svg",
      alt: "Kettlebell",
      offsetY: 50,
    },
    photos: [
      { src: "/photos/placeholder.jpg", alt: "Camp", rotation: -3 },
      { src: "/photos/placeholder.jpg", alt: "Training", rotation: 2 },
      { src: "/photos/placeholder.jpg", alt: "Group", rotation: -1 },
      { src: "/photos/placeholder.jpg", alt: "Activity", rotation: 4 },
    ],
    cover: { src: "/photos/placeholder.jpg", alt: "Beta Camp cover", rotation: -2 },
  },
];

export default function CommunityPage() {
  return (
    <FaceLayout faceId="community" className="bg-[#FFFCF3]">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold">jake&apos;s hosting wall</h1>
          <p className="text-foreground/60 mt-2">
            a polaroid collection of the communities i&apos;ve built and lead
            over the past 7 years.
          </p>
        </div>
      </div>

      <CommunityWall rows={COMMUNITY_ROWS} />
    </FaceLayout>
  );
}

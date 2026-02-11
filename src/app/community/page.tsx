import FaceLayout from "@/components/FaceLayout";
import CommunityWall from "@/components/CommunityWall";

// Each row represents a community with 4 regular photos, 1 wide cover photo, and an artifact
const COMMUNITY_ROWS = [
  {
    id: "socratica",
    coverPosition: 3,
    artifactPosition: 5,
    artifact: {
      src: "/community-artifacts/socratica-svg.svg",
      hoverSrc: "/community-artifacts/socratica-svg-hover.svg",
      alt: "Croissant",
      offsetY: 24,
    },
    photos: [
      { src: "/community-images/socratica-1.png", alt: "Community event", rotation: -3 },
      { src: "/community-images/socratica-2.png", alt: "Group photo", rotation: 2 },
      { src: "/community-images/socratica-3.png", alt: "Demo day", rotation: -1 },
      { src: "/community-images/socratica-4.png", alt: "Outdoor event", rotation: 4 },
    ],
    cover: { src: "/community-images/socratica-cover.png", alt: "Socratica cover", rotation: 1, link: "https://www.socratica.info/" },
  },
  {
    id: "go-outside",
    coverPosition: 5,
    artifactPosition: 1,
    artifact: {
      src: "/community-artifacts/go-outside-svg.svg",
      hoverSrc: "/community-artifacts/go-outside-svg-hover.svg",
      alt: "Trophy",
      size: 185,
    },
    photos: [
      { src: "/community-images/go-outside-1.png", alt: "Outside event", rotation: 2 },
      { src: "/community-images/go-outside-2.png", alt: "Nature", rotation: -2 },
      { src: "/community-images/go-outside-3.png", alt: "Group", rotation: 4 },
      { src: "/community-images/go-outside-4.png", alt: "Adventure", rotation: -1 },
    ],
    cover: { src: "/community-images/go-outside-cover.png", alt: "Go Outside cover", rotation: 1, link: "https://wygo.world/the-go-outside-games" },
  },
  {
    id: "symposium",
    coverPosition: 1,
    artifactPosition: 3,
    artifact: {
      src: "/community-artifacts/symposium-svg.svg",
      hoverSrc: "/community-artifacts/symposium-svg-hover.svg",
      alt: "Hockey jersey",
      size: 185,
      offsetY: 24,
    },
    photos: [
      { src: "/community-images/symposium-1.png", alt: "Symposium", rotation: 2 },
      { src: "/community-images/symposium-2.png", alt: "Stage", rotation: -3 },
      { src: "/community-images/symposium-3.png", alt: "Crowd", rotation: 1 },
      { src: "/community-images/symposium-4.png", alt: "Demo", rotation: -2 },
    ],
    cover: { src: "/community-images/symposium-cover.png", alt: "Symposium cover", rotation: -1, link: "https://luma.com/waterloo" },
  },
  {
    id: "hotgxrl",
    coverPosition: 3,
    artifactPosition: 6,
    artifact: {
      src: "/community-artifacts/hotgxrl-svg.svg",
      hoverSrc: "/community-artifacts/hotgxrl-svg-hover.svg",
      alt: "Ice cream cone",
      size: 185,
      offsetY: -15,
    },
    photos: [
      { src: "/community-images/hot-gxrl-1.png", alt: "Walk club", rotation: -2 },
      { src: "/community-images/hot-gxrl-2.png", alt: "Group walk", rotation: 3 },
      { src: "/community-images/hot-gxrl-3.png", alt: "Event photo", rotation: -4 },
      { src: "/community-images/hot-gxrl-4.png", alt: "Community", rotation: 1 },
    ],
    cover: { src: "/community-images/hot-gxrl-cover.png", alt: "Hot Gxrl cover", rotation: 2, link: "https://wygo.world/hotgxrl-4" },
  },
  {
    id: "silly-songs",
    coverPosition: 4,
    artifactPosition: 2,
    artifact: {
      src: "/community-artifacts/silly-songs-svg.svg",
      hoverSrc: "/community-artifacts/silly-songs-svg-hover.svg",
      alt: "Guitar",
      size: 320,
      offsetY: -120,
    },
    photos: [
      { src: "/community-images/silly-little-songs-1.png", alt: "Music night", rotation: 2 },
      { src: "/community-images/silly-little-songs-2.png", alt: "Performance", rotation: -2 },
      { src: "/community-images/silly-little-songs-3.png", alt: "Jam session", rotation: 4 },
      { src: "/community-images/silly-little-songs-4.png", alt: "Singing", rotation: -3 },
    ],
    cover: { src: "/community-images/silly-little-songs-cover.png", alt: "Silly Songs cover", rotation: 1, link: "https://luma.com/dk6vv80h" },
  },
  {
    id: "kickoff",
    coverPosition: 2,
    artifactPosition: 4,
    artifact: {
      src: "/community-artifacts/kickoff-svg.svg",
      hoverSrc: "/community-artifacts/kickoff-svg-hover.svg",
      alt: "Traffic cone",
      size: 180,
      offsetY: 20,
    },
    photos: [
      { src: "/community-images/kickoff-1.png", alt: "Friends", rotation: -1 },
      { src: "/community-images/kickoff-2.png", alt: "Team", rotation: 3 },
      { src: "/community-images/kickoff-3.png", alt: "Kickoff event", rotation: -4 },
      { src: "/community-images/kickoff-4.png", alt: "Group", rotation: 2 },
    ],
    cover: { src: "/community-images/kickoff-cover.png", alt: "Kickoff cover", rotation: -2, link: "https://luma.com/kickoff-s24" },
  },
  {
    id: "syde",
    coverPosition: 6,
    artifactPosition: 1,
    artifact: {
      src: "/community-artifacts/syde-svg.svg",
      hoverSrc: "/community-artifacts/syde-svg-hover.svg",
      alt: "Sharpie",
    },
    photos: [
      { src: "/community-images/syde-1.png", alt: "SYDE event", rotation: -1 },
      { src: "/community-images/syde-2.png", alt: "Classmates", rotation: 3 },
      { src: "/community-images/syde3.png", alt: "Project", rotation: -3 },
      { src: "/community-images/syde4.png", alt: "Studio", rotation: 2 },
    ],
    cover: { src: "/community-images/syde-cover.png", alt: "SYDE cover", rotation: -2, link: "https://uwaterloo.ca/engineering/future-students/systems-design-engineering" },
  },
  {
    id: "deca",
    coverPosition: 2,
    artifactPosition: 5,
    artifact: {
      src: "/community-artifacts/deca-svg.svg",
      hoverSrc: "/community-artifacts/deca-svg-hover.svg",
      alt: "Mug",
      size: 180,
      offsetY: 30,
    },
    photos: [
      { src: "/community-images/deca-1.png", alt: "Competition", rotation: 2 },
      { src: "/community-images/deca-2.png", alt: "Team", rotation: -2 },
      { src: "/community-images/deca-3.png", alt: "Awards", rotation: 1 },
      { src: "/community-images/deca-4.png", alt: "Presentation", rotation: -3 },
    ],
    cover: { src: "/community-images/deca-cover.png", alt: "DECA cover", rotation: 3, link: "https://deca.ca/v2/" },
  },
  {
    id: "beta-camp",
    coverPosition: 4,
    artifactPosition: 3,
    artifact: {
      src: "/community-artifacts/beta-camp-svg.svg",
      hoverSrc: "/community-artifacts/beta-camp-svg-hover.svg",
      alt: "Kettlebell",
      offsetY: 50,
    },
    photos: [
      { src: "/community-images/beta-camp-1.png", alt: "Camp", rotation: -3 },
      { src: "/community-images/beta-camp-2.png", alt: "Training", rotation: 2 },
      { src: "/community-images/beta-camp-3.png", alt: "Group", rotation: -1 },
      { src: "/community-images/beta-camp-4.png", alt: "Activity", rotation: 4 },
    ],
    cover: { src: "/community-images/beta-camp-cover.png", alt: "Beta Camp cover", rotation: -2, link: "https://www.joinprequel.com/" },
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

/** Fictional editorial fixtures. Images were generated with imagegen. */
export interface NewsStory {
  id: string;
  category: string;
  title: string;
  summary: string;
  image: string;
  alt: string;
  author: string;
  minutes: number;
  body: string[];
}

export const newsStories: NewsStory[] = [
  {
    id: "coastal-cities",
    category: "World",
    title: "A new chapter for the world’s coastal cities",
    summary:
      "From greener waterfronts to streets made for people, a new generation of coastal cities is learning to live with the water.",
    image: "waterfront",
    alt: "A sunlit waterfront promenade curves around a modern coastal city.",
    author: "Leila Rahman",
    minutes: 6,
    body: [
      "At the edge of the city, a familiar boundary is becoming a meeting place. A waterfront once designed around traffic now makes room for shade, walking and the changing rhythm of the tide.",
      "In this imagined city, planners begin with a simple question: what would a shoreline look like if the people who use it helped shape it? Their answer brings planted edges, public spaces and everyday journeys into the same conversation.",
      "There is no single blueprint. The useful lesson is to make room for experiments, listen to residents and treat the coast as a shared public space. This story is fictional sample reporting for The Current.",
    ],
  },
  {
    id: "rail",
    category: "Business",
    title: "The new rail routes reshaping a connected world",
    summary:
      "A slower way to travel is opening up a bigger world. Meet the places finding opportunity along the tracks.",
    image: "rail",
    alt: "A high-speed train follows an alpine lake beneath snow-capped mountains.",
    author: "Marcus Chen",
    minutes: 5,
    body: [
      "The journey starts before the destination. From the carriage window, villages, water and mountains become part of the day rather than something to fly over.",
      "Our fictional route follows a regional partnership built around reliable connections. Local businesses hope that an easier journey will encourage visitors to stop, explore and return.",
      "The questions are practical: how to make tickets simple, transfers predictable and stations welcoming. In this sample story, good transport begins with the people using it.",
    ],
  },
  {
    id: "materials",
    category: "Science",
    title: "A small discovery with a big possibility",
    summary:
      "Inside the labs asking a deceptively simple question: what if the next breakthrough used less?",
    image: "laboratory",
    alt: "A scientist examines a translucent material sample beside a microscope.",
    author: "Elena Kovacs",
    minutes: 4,
    body: [
      "The sample fits between two fingertips. In our imagined research lab, that small object is the beginning of a larger conversation about the materials we use every day.",
      "The team is exploring how to do more with less, testing each idea repeatedly before making any claims about its potential. Results that do not work are recorded with the same care as promising ones.",
      "This fictional research story illustrates curiosity and the process of discovery. It does not describe a verified scientific result or a product available to buy.",
    ],
  },
  {
    id: "markets",
    category: "Business",
    title: "Local markets, global impact",
    summary:
      "How the everyday connections between growers, traders and neighbours keep a city moving.",
    image: "market",
    alt: "A produce vendor arranges fresh vegetables at an outdoor neighbourhood market.",
    author: "Amara Okafor",
    minutes: 6,
    body: [
      "Before most of the neighbourhood is awake, the first crates arrive. The market is a place of work, but it is also where news, recipes and familiar greetings change hands.",
      "For this fictional feature, we follow the path from grower to stall. Shorter routes can build stronger relationships, though the practical challenges of space and reliable income remain.",
      "Behind each display is a network of people. Their everyday decisions shape what a community eats and where it gathers.",
    ],
  },
  {
    id: "football",
    category: "Sport",
    title: "A new generation unites the game",
    summary:
      "Beyond the floodlights, community clubs are finding new ways to bring people onto the pitch.",
    image: "stadium",
    alt: "A crowded football stadium under bright floodlights at dusk.",
    author: "Daniel Ellis",
    minutes: 4,
    body: [
      "The loudest moment belongs to the crowd, but the story starts on a much smaller pitch. Across our fictional sporting community, volunteers are making room for new players.",
      "Accessible sessions, shared equipment and a welcoming first practice can matter as much as the final score. Coaches describe progress in confidence as well as results.",
      "This is a sample feature about the connections around sport. No real match, team or result is being reported.",
    ],
  },
  {
    id: "wild",
    category: "World",
    title: "A wilder, brighter tomorrow",
    summary:
      "Across continents, communities are finding new ways to protect the natural places that sustain us.",
    image: "mountains",
    alt: "Golden trees and snow-covered peaks reflected in a still turquoise mountain lake.",
    author: "Sofia Navarro",
    minutes: 8,
    body: [
      "Some landscapes invite you to stop. At this imagined lakeside reserve, looking after the view means looking after the relationships around it too.",
      "Residents, guides and conservation workers discuss what responsible access might mean: clear paths, quiet spaces and decisions that last beyond a busy season.",
      "The photograph is AI-generated and the location is illustrative. The story offers a fictional starting point for a conversation about shared stewardship.",
    ],
  },
  {
    id: "ocean",
    category: "Science",
    title: "The ocean’s quiet comeback",
    summary:
      "A closer look at the extraordinary life beneath the surface, and the people working to understand it.",
    image: "reef",
    alt: "A green sea turtle swims over a coral reef in clear blue water.",
    author: "Elena Kovacs",
    minutes: 5,
    body: [
      "Under the surface, a reef is full of movement. Fish weave between corals while a turtle glides through a shaft of sunlight.",
      "This sample documentary outline follows an imagined monitoring team returning to the same sites over time. Patient observation helps them ask better questions about how a habitat changes.",
      "The preview uses an AI-generated still. The accompanying text is a sample transcript, not a record of a filmed expedition.",
    ],
  },
  {
    id: "art",
    category: "Culture",
    title: "The power of places to inspire",
    summary:
      "From neighbourhood galleries to shared creative spaces, a look at how art brings us together.",
    image: "gallery",
    alt: "Two visitors walk through a sunlit gallery of large abstract paintings.",
    author: "Sofia Navarro",
    minutes: 5,
    body: [
      "A gallery can be a quiet room and a lively conversation at the same time. The works on these walls invite visitors to look again at the colours and spaces around them.",
      "Our fictional cultural space brings workshops, exhibitions and local stories together. The curators want a first visit to feel like an invitation rather than a test.",
      "All artworks and people shown are generated illustrations. This sample story does not review a real exhibition.",
    ],
  },
  {
    id: "public-space",
    category: "Politics",
    title: "Who gets to shape the city’s next chapter?",
    summary:
      "New civic assemblies put everyday experiences at the heart of the conversation about public space.",
    image: "waterfront",
    alt: "Pedestrians share a wide waterfront promenade lined with planting.",
    author: "Leila Rahman",
    minutes: 7,
    body: [
      "The meeting begins with a map. Residents mark the places they love, the journeys they find difficult and the corners they would like to change.",
      "In this fictional civic assembly, a range of voices helps explore trade-offs before a proposal is made. The conversation includes maintenance and accessibility as well as ambitious new ideas.",
      "No actual policy decision or political event is described. This is an illustrative story about public participation.",
    ],
  },
  {
    id: "opinion-cities",
    category: "Opinion",
    title: "Better cities begin with a seat at the table",
    summary: "The future of a place belongs to the people who call it home.",
    image: "waterfront",
    alt: "An open public promenade at the edge of a coastal city.",
    author: "Leila Rahman",
    minutes: 3,
    body: [
      "A useful question for any new public space is who was invited to imagine it. An open conversation can reveal needs that a drawing alone will miss.",
      "This fictional opinion essay argues for patient listening and small, visible experiments. A good place is never finished; it grows with the community around it.",
    ],
  },
  {
    id: "opinion-science",
    category: "Opinion",
    title: "Progress works best when we share the questions",
    summary: "Making room for curiosity is a collective act.",
    image: "laboratory",
    alt: "A researcher carefully studies a material sample.",
    author: "Marcus Chen",
    minutes: 4,
    body: [
      "We often tell stories about discovery as if the answer arrived all at once. The more interesting story may be the questions that made it possible.",
      "In this fictional essay, curiosity is a shared practice: something to encourage in classrooms, workplaces and everyday conversations.",
    ],
  },
  {
    id: "opinion-culture",
    category: "Opinion",
    title: "A little more room for wonder",
    summary: "Why culture should be part of our everyday lives.",
    image: "gallery",
    alt: "Warm daylight fills a contemporary art gallery.",
    author: "Elena Kovacs",
    minutes: 3,
    body: [
      "Not every visit needs an explanation. Sometimes a room, a painting or a conversation gives us permission to pay attention in a different way.",
      "This fictional essay makes a modest case for everyday encounters with art, and for spaces that make those encounters welcoming.",
    ],
  },
];

export const newsVideos = [
  {
    storyId: "ocean",
    label: "Planet",
    duration: "05:18",
    title: "The ocean’s quiet comeback",
  },
  {
    storyId: "materials",
    label: "Innovation",
    duration: "04:32",
    title: "Small ideas. Extraordinary possibilities.",
  },
  {
    storyId: "coastal-cities",
    label: "Cities",
    duration: "06:45",
    title: "Greener cities, brighter lives",
  },
];

export function getNewsStory(id: string): NewsStory {
  const story = newsStories.find((item) => item.id === id);
  if (!story) throw new Error(`Unknown sample story: ${id}`);
  return story;
}

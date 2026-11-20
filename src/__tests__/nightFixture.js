export const paidNight = {
  id: 1,
  title: "Detty Dezemba",
  category: "music",
  description: "Live Afro house artists in Nairobi.",
  image: "https://example.com/detty.jpg",
  startTime: "19:00",
  endTime: "Till Dawn",
  price: "4500",
  currency: "KES",
  location: { venue: "Uhuru Gardens", address: "Nairobi", lat: -1.32, long: 36.8 },
};

export const freeNight = {
  ...paidNight,
  id: 2,
  title: "Zawadi Band Performance",
  price: "free",
  startTime: "18:00",
  endTime: "22:00",
  location: { venue: "Sarova Stanley Hotel", address: "Kimathi Street" },
};
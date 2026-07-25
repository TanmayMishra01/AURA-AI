import { GeneratedImage, StyleOption, PromptTemplate } from "../types";

export const INITIAL_GALLERY: GeneratedImage[] = [
  {
    id: "img-1",
    url: "https://images.unsplash.com/photo-1618005182384-a438f6e931ba?w=800&q=80",
    prompt: "Abstract fluid neon liquid wave with vibrant blue and magenta gradient lighting",
    aspectRatio: "1:1",
    style: "Digital Art",
    createdAt: "2 mins ago",
    isFavorite: true,
    likesCount: 124,
    tags: ["Abstract", "Neon", "Fluid"],
  },
  {
    id: "img-2",
    url: "https://images.unsplash.com/photo-1633356124520-7d318500393e?w=800&q=80",
    prompt: "Futuristic cyberpunk robot helmet glowing in a dark metallic studio setting",
    aspectRatio: "1:1",
    style: "Cyberpunk",
    createdAt: "10 mins ago",
    isFavorite: false,
    likesCount: 89,
    tags: ["Cyberpunk", "3D", "Sci-Fi"],
  },
  {
    id: "img-3",
    url: "https://images.unsplash.com/photo-1620649189958-4b2cc298a242?w=800&q=80",
    prompt: "Etherial luminescent jellyfish floating through deep obsidian ocean with bioluminescent light",
    aspectRatio: "1:1",
    style: "Fantasy Art",
    createdAt: "1 hour ago",
    isFavorite: true,
    likesCount: 256,
    tags: ["Fantasy", "Nature", "Glow"],
  },
  {
    id: "img-4",
    url: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800&q=80",
    prompt: "Hyper-realistic glowing crystal galaxy sphere suspended in space with cosmic particles",
    aspectRatio: "1:1",
    style: "Photorealistic",
    createdAt: "3 hours ago",
    isFavorite: false,
    likesCount: 198,
    tags: ["Space", "Crystal", "Cosmic"],
  },
  {
    id: "img-5",
    url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80",
    prompt: "Oil painting portrait of a mystical renaissance sorceress in gold embroidered robes",
    aspectRatio: "1:1",
    style: "Cinematic",
    createdAt: "5 hours ago",
    isFavorite: false,
    likesCount: 310,
    tags: ["Art", "Classic", "Portrait"],
  },
  {
    id: "img-6",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
    prompt: "Minimalist geometric architectural monument in a fog shrouded desert at sunrise",
    aspectRatio: "1:1",
    style: "3D Render",
    createdAt: "1 day ago",
    isFavorite: false,
    likesCount: 142,
    tags: ["Architecture", "Minimal", "Desert"],
  },
];

export const STYLE_OPTIONS: StyleOption[] = [
  { id: "none", name: "None", promptSuffix: "", previewUrl: "https://images.unsplash.com/photo-1618005182384-a438f6e931ba?w=200&q=80" },
  { id: "photo", name: "Photorealistic", promptSuffix: "photorealistic, 8k resolution, highly detailed DSLR photo", previewUrl: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=200&q=80" },
  { id: "cyberpunk", name: "Cyberpunk", promptSuffix: "cyberpunk aesthetic, vibrant neon lights, futuristic high-tech, dark atmosphere", previewUrl: "https://images.unsplash.com/photo-1633356124520-7d318500393e?w=200&q=80" },
  { id: "anime", name: "Anime", promptSuffix: "vibrant anime style, detailed digital illustration, studio ghibli inspired, clean line art", previewUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&q=80" },
  { id: "digital", name: "Digital Art", promptSuffix: "masterpiece digital art, Octane render, smooth lighting, trending on ArtStation", previewUrl: "https://images.unsplash.com/photo-1620649189958-4b2cc298a242?w=200&q=80" },
  { id: "fantasy", name: "Fantasy", promptSuffix: "epic fantasy art, mythical atmosphere, glowing magic runes, detailed oil texture", previewUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&q=80" },
  { id: "3d", name: "3D Render", promptSuffix: "3D blender render, soft studio lighting, clay shading, smooth geometry", previewUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&q=80" },
];

export const PROMPT_IDEAS: PromptTemplate[] = [
  {
    title: "Cyberpunk City",
    prompt: "A futuristic metropolis with soaring glass skyscrapers bathed in neon rain, flying vehicles, retro-futuristic billboards",
    category: "Sci-Fi",
  },
  {
    title: "Zen Garden",
    prompt: "A peaceful Japanese rock garden surrounded by glowing cherry blossom trees at twilight with misty koi pond",
    category: "Nature",
  },
  {
    title: "Cosmic Astronaut",
    prompt: "An astronaut floating gently in deep space holding a glowing miniature galaxy inside a glass sphere",
    category: "Space",
  },
  {
    title: "Mythical Dragon",
    prompt: "An ancient dragon crafted entirely from molten emerald and gold perched atop a snow covered mountain peak",
    category: "Fantasy",
  },
  {
    title: "Neon Cyber Cat",
    prompt: "A sleek feline wearing holographic VR goggles sitting on top of a glowing retro synthesizer",
    category: "Cyberpunk",
  },
  {
    title: "Surreal Floating Island",
    prompt: "A majestic floating island with cascading waterfalls dropping into clouds, whimsical glowing flora and fauna",
    category: "Fantasy",
  },
];

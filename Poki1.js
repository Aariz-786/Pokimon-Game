//Implement your code here
//Use async await to get the data from the api.
const POKE_API_URL = "https://pokeapi.co/api/v2/pokemon/?limit=150";

const fightBtn = document.getElementById("fight");

// Player 1 Elements
const p1NameHeader = document.getElementById("p1_name");
const p1ScoreEl = document.getElementById("p1_score");
const p1Img = document.querySelector("#player1 #img");
const p1NameCard = document.querySelector("#player1 #name");
const p1Exp = document.querySelector("#player1 #experience");
const p1Abilities = document.querySelector("#player1 #abilities");

// Player 2 Elements
const p2NameHeader = document.getElementById("p2_name");
const p2ScoreEl = document.getElementById("p2_score");
const p2Img = document.querySelector("#player2 #img");
const p2NameCard = document.querySelector("#player2 #name");
const p2Exp = document.querySelector("#player2 #experience");
const p2Abilities = document.querySelector("#player2 #abilities");

let pokemonList = [];
let p1Score = 0;
let p2Score = 0;

// Initialize header info
p1NameHeader.textContent = "Player 1";
p2NameHeader.textContent = "Player 2";
p1ScoreEl.textContent = `Score: ${p1Score}`;
p2ScoreEl.textContent = `Score: ${p2Score}`;

// 1. Fetch master list using async/await
async function initializePokemonList() {
    try {
        const response = await fetch(POKE_API_URL);
        const data = await response.json();
        pokemonList = data.results;
    } catch (error) {
        console.error("Failed to fetch Pok?mon list:", error);
    }
}

// 2. Reusable helper to fetch individual Pok?mon data using async/await
async function fetchPokemonDetails(url) {
    const response = await fetch(url);
    return await response.json();
}

// 3. Helper to render card info cleanly
function renderPokemonCard(nameEl, expEl, imgEl, abilitiesEl, pokemon, spriteUrl) {
    nameEl.textContent = pokemon.name.toUpperCase();
    expEl.textContent = `Exp: ${pokemon.base_experience || 0}`;
    imgEl.innerHTML = spriteUrl ? `<img src="${spriteUrl}" alt="${pokemon.name}">` : '';
    abilitiesEl.innerHTML = `Abilities:` + pokemon.abilities
        .map(item => `<li>${item.ability.name}</li>`)
        .join("");
}

// 4. Main Fight Handler optimized with async/await and Promise.all
async function handleFight() {
    if (pokemonList.length === 0) {
        alert("Pok?mon list is still loading. Please try again.");
        return;
    }

    // Pick two random distinct indices
    const index1 = Math.floor(Math.random() * pokemonList.length);
    let index2 = Math.floor(Math.random() * pokemonList.length);
    while (index1 === index2) {
        index2 = Math.floor(Math.random() * pokemonList.length);
    }

    const p1Entry = pokemonList[index1];
    const p2Entry = pokemonList[index2];

    try {
        // Fetch both players' details concurrently without chaining `.then()`
        const [p1Data, p2Data] = await Promise.all([
            fetchPokemonDetails(p1Entry.url),
            fetchPokemonDetails(p2Entry.url)
        ]);

        // Resolve clean SVG image URLs with fallbacks
        const p1Sprite = p1Data.sprites?.other?.['dream_world']?.front_default || 
                         `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${p1Data.id}.svg` || 
                         p1Data.sprites?.front_default || '';

        const p2Sprite = p2Data.sprites?.other?.['dream_world']?.front_default || 
                         `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${p2Data.id}.svg` || 
                         p2Data.sprites?.front_default || '';

        // Render both cards
        renderPokemonCard(p1NameCard, p1Exp, p1Img, p1Abilities, p1Data, p1Sprite);
        renderPokemonCard(p2NameCard, p2Exp, p2Img, p2Abilities, p2Data, p2Sprite);

        // Compare experience and update scores
        const exp1 = p1Data.base_experience || 0;
        const exp2 = p2Data.base_experience || 0;

        if (exp1 > exp2) {
            p1Score++;
        } else if (exp2 > exp1) {
            p2Score++;
        }

        p1ScoreEl.textContent = `Score: ${p1Score}`;
        p2ScoreEl.textContent = `Score: ${p2Score}`;

    } catch (error) {
        console.error("Error executing the battle:", error);
    }
}

// Event listener
fightBtn.addEventListener("click", handleFight);

// Initial call to load data
initializePokemonList();
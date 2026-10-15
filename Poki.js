const POKE_API_URL = "https://pokeapi.co/api/v2/pokemon/?limit=150";

const fightBtn = document.getElementById("fight");

// Player 1 Elements (Scoped to #player1)
const p1NameHeader = document.getElementById("p1_name");
const p1ScoreEl = document.getElementById("p1_score");
const p1Img = document.querySelector("#player1 #img");
const p1NameCard = document.querySelector("#player1 #name");
const p1Exp = document.querySelector("#player1 #experience");
const p1Abilities = document.querySelector("#player1 #abilities");

// Player 2 Elements (Scoped to #player2)
const p2NameHeader = document.getElementById("p2_name");
const p2ScoreEl = document.getElementById("p2_score");
const p2Img = document.querySelector("#player2 #img");
const p2NameCard = document.querySelector("#player2 #name");
const p2Exp = document.querySelector("#player2 #experience");
const p2Abilities = document.querySelector("#player2 #abilities");

let pokemonList = [];
let p1Score = 0;
let p2Score = 0;

// Set initial header info
p1NameHeader.textContent = "Player 1";
p2NameHeader.textContent = "Player 2";
p1ScoreEl.textContent = `Score: ${p1Score}`;
p2ScoreEl.textContent = `Score: ${p2Score}`;

// 1. Fetch master list of Pok?mon when the application loads
async function fetchPokemonList() {
    try {
        const response = await fetch(POKE_API_URL);
        const data = await response.json();
        pokemonList = data.results;
    } catch (error) {
        console.error("Failed to fetch Pok?mon list:", error);
    }
}

// 2. Fetch specific details for a chosen Pok?mon URL
async function fetchPokemonDetails(url) {
    const response = await fetch(url);
    return await response.json();
}

// 3. Handle the battle logic on "Fight" click
async function handleFight() {
    if (pokemonList.length === 0) {
        alert("Pok?mon list is still loading. Please try again in a moment.");
        return;
    }

    // Pick two random distinct indexes from the list
    const index1 = Math.floor(Math.random() * pokemonList.length);
    let index2 = Math.floor(Math.random() * pokemonList.length);
    while (index1 === index2) {
        index2 = Math.floor(Math.random() * pokemonList.length);
    }

    const p1Entry = pokemonList[index1];
    const p2Entry = pokemonList[index2];

    try {
        // Fetch details for both combatants concurrently using Promise.all
        const [p1Data, p2Data] = await Promise.all([
            fetchPokemonDetails(p1Entry.url),
            fetchPokemonDetails(p2Entry.url)
        ]);

      // Use Dream World SVG artwork (falls back to standard sprite if SVG isn't available)
        const p1Sprite = p1Data.sprites?.other?.['dream_world']?.front_default || 
                         `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${p1Data.id}.svg` || 
                         p1Data.sprites?.front_default || '';

        const p2Sprite = p2Data.sprites?.other?.['dream_world']?.front_default || 
                         `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${p2Data.id}.svg` || 
                         p2Data.sprites?.front_default || '';

        // Render Player 1 Card Data
        p1NameCard.textContent = p1Data.name.toUpperCase();
        p1Exp.textContent = `Exp: ${p1Data.base_experience || 0}`;
        p1Img.innerHTML = p1Sprite ? `<img src="${p1Sprite}" alt="${p1Data.name}">` : '';
        
        p1Abilities.innerHTML = `Abilities:` + p1Data.abilities
            .map(item => `<li>${item.ability.name}</li>`)
            .join("");

        // Render Player 2 Card Data
        p2NameCard.textContent = p2Data.name.toUpperCase();
        p2Exp.textContent = `Exp: ${p2Data.base_experience || 0}`;
        p2Img.innerHTML = p2Sprite ? `<img src="${p2Sprite}" alt="${p2Data.name}">` : '';
        
        p2Abilities.innerHTML = `Abilities:` + p2Data.abilities
            .map(item => `<li>${item.ability.name}</li>`)
            .join("");

        // Compare Experience and Update Scores
        const exp1 = p1Data.base_experience || 0;
        const exp2 = p2Data.base_experience || 0;

        if (exp1 > exp2) {
            p1Score++;
        } else if (exp2 > exp1) {
            p2Score++;
        }
        // If it's a tie, neither score changes

        // Update score display elements
        p1ScoreEl.textContent = `Score: ${p1Score}`;
        p2ScoreEl.textContent = `Score: ${p2Score}`;

    } catch (error) {
        console.error("Error executing the battle:", error);
    }
}

// Attach event listener to Fight button
fightBtn.addEventListener("click", handleFight);

// Initialize the data load
fetchPokemonList();
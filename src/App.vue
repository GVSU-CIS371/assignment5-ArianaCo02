<template>
  <div>
    <h1>Custom Drink Maker</h1>

    <!-- AUTH SECTION -->
    <div class="auth-section">
      <!-- BEFORE LOGIN -->
      <div v-if="!store.user">
        <button @click="withGoogle">Sign in with Google</button>
        <p v-if="errorMessage" style="color:red">{{ errorMessage }}</p>
      </div>

      <!-- AFTER LOGIN -->
      <div v-else>
        <p>Signed in as: {{ store.user.email }}</p>
        <button @click="signOutUser">Sign Out</button>
      </div>
    </div>

    <hr />

    <!-- DRINK MAKER SECTION (only if logged in) -->
    <div v-if="store.user">
      <label>Base:</label>
      <select v-model="store.currentBase">
        <option v-for="b in store.bases" :key="b.id" :value="b">
          {{ b.name }}
        </option>
      </select>

      <label>Creamer:</label>
      <select v-model="store.currentCreamer">
        <option v-for="c in store.creamers" :key="c.id" :value="c">
          {{ c.name }}
        </option>
      </select>

      <label>Syrup:</label>
      <select v-model="store.currentSyrup">
        <option v-for="s in store.syrups" :key="s.id" :value="s">
          {{ s.name }}
        </option>
      </select>

      <label>Beverage Name:</label>
      <input v-model="beverageName" placeholder="Enter beverage name" />

      <button :disabled="!store.user" @click="makeBeverageAction">
        Make Beverage
      </button>

      <p v-if="message" style="color: green">{{ message }}</p>
    </div>

    <hr />

    <!-- SAVED BEVERAGES (only for signed-in user) -->
    <h2 v-if="store.user">Your Saved Beverages</h2>
    <div id="beverage-container" v-if="store.user">
      <div v-for="bev in store.beverages" :key="bev.id">
        <input
          type="radio"
          :id="bev.id"
          name="beverage"
          :value="bev.id"
          v-model="selectedId"
          @change="store.currentBeverage = bev"
        />
        <label :for="bev.id">
          {{ bev.name }} — {{ bev.base.name }} + {{ bev.creamer.name }} + {{ bev.syrup.name }}
        </label>
      </div>
    </div>

    <!-- CURRENT DRINK DISPLAY -->
    <h2 v-if="store.currentBeverage">Your Mug</h2>
    <div
      v-if="store.currentBeverage"
      id="mug"
      :style="{
        width: '200px',
        height: '200px',
        border: '2px solid black',
        borderRadius: '10px',
        backgroundColor: store.currentBeverage.base.color,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }"
    >
      <p>{{ store.currentBeverage.base.name }}</p>
      <p>{{ store.currentBeverage.creamer.name }}</p>
      <p>{{ store.currentBeverage.syrup.name }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useBeverageStore } from "./stores/beverageStore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const store = useBeverageStore();
const beverageName = ref("");
const selectedId = ref("");
const message = ref("");
const errorMessage = ref("");

const auth = getAuth();


onMounted(() => {
 
});

/* Google Sign In */
async function withGoogle() {
  const provider = new GoogleAuthProvider();
  errorMessage.value = "";

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    store.setUser({
      uid: user.uid,
      email: user.email,
    });
  } catch (err: any) {
    console.error(err);
    errorMessage.value = "Google Sign-In failed. Please try again.";
  }
}

/* Sign Out */
async function signOutUser() {
  await signOut(auth);
  store.setUser(null);
  message.value = "";
  selectedId.value = "";
}

/* Create Beverage */
async function makeBeverageAction() {
  const result = await store.makeBeverage(beverageName.value);
  message.value = result;
  beverageName.value = "";
}
</script>

<style scoped>
#beverage-container {
  margin: 1rem 0;
}
#beverage-container div {
  margin-bottom: 0.5rem;
}
</style>

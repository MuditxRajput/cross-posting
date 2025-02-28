import { createSlice } from '@reduxjs/toolkit';

const socialSlice = createSlice({
  name: "social",
  initialState: {
    youtube: [] as string[],
    facebook: [] as string[],
    linkedIn: [] as string[],
    instagram: [] as string[],
    cycle : 5,
    leftpanel:false
  },
  reducers: {
    setYoutube: (state, action) => {
      if (!state.youtube.includes(action.payload)) {
        state.youtube = [...state.youtube, action.payload];
      }
    },
    setFacebook: (state, action) => {
      if (!state.facebook.includes(action.payload)) {
        state.facebook = [...state.facebook, action.payload];
      }
    },
    setLinkedIn: (state, action) => {
      if (!state.linkedIn.includes(action.payload)) {
        state.linkedIn = [...state.linkedIn, action.payload];
      }
    },
    setInstagram: (state, action) => {
      if (!state.instagram.includes(action.payload)) {
        state.instagram = [...state.instagram, action.payload];
      }
    },
    removeYoutube : (state,action)=>{
        state.youtube = state.youtube.filter((item)=>item!==action.payload);
    },
    removeInstagram :(state,action)=>{
        state.instagram = state.instagram.filter((item)=>item!==action.payload);
    },
    removeLinkedIn : (state,action)=>{
        state.linkedIn = state.linkedIn.filter((item)=>item!==action.payload);
    },
    removeFacebook : (state,action)=>{
        state.facebook = state.facebook.filter((item)=>item!==action.payload);
    },
    reduceCycle : (state,action)=>{
      state.cycle = action.payload;
    },
    setLeftPanel : (state,action)=>{
      state.leftpanel = action.payload
    }
  }
});

export const {setLeftPanel,reduceCycle, setYoutube, setFacebook, setLinkedIn, setInstagram,removeYoutube,removeInstagram ,removeLinkedIn,removeFacebook} = socialSlice.actions;
export default socialSlice.reducer;

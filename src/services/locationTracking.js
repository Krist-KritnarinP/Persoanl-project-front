import { mainApi } from "@/api/mainApi";

let watchId=null;
let expiryTimer=null;
let activeConversation=null;

export function stopLocationTracking(revoke=false){
  if(watchId!==null&&navigator.geolocation)navigator.geolocation.clearWatch(watchId);
  if(expiryTimer!==null)clearTimeout(expiryTimer);
  const conversationId=activeConversation;
  watchId=null;expiryTimer=null;activeConversation=null;
  if(revoke&&conversationId)mainApi.delete(`/social/conversations/${conversationId}/location-shares`).catch(()=>{});
}

export function startLocationTracking(conversationId,expiresAt){
  stopLocationTracking(false);
  if(!navigator.geolocation)return false;
  activeConversation=conversationId;
  const remaining=Math.max(0,new Date(expiresAt).getTime()-Date.now());
  expiryTimer=setTimeout(()=>stopLocationTracking(false),remaining);
  watchId=navigator.geolocation.watchPosition(({coords})=>{
    mainApi.put(`/social/conversations/${conversationId}/location`,{
      latitude:coords.latitude,longitude:coords.longitude,accuracy:coords.accuracy,
    }).catch(()=>{});
  },()=>{}, {enableHighAccuracy:true,maximumAge:5000,timeout:15000});
  return true;
}

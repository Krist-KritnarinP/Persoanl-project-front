import { test, expect } from "@playwright/test";
const headers={"access-control-allow-origin":"http://127.0.0.1:5188","access-control-allow-credentials":"true","access-control-allow-headers":"content-type,authorization","access-control-allow-methods":"GET,POST,PUT,DELETE,OPTIONS"};
const fixture=role=>({id:71,userId:1,accessRole:role,tripName:"Nearby adventures",destination:"Bangkok",days:[{id:81,dayCount:1,dayDate:"2026-10-01",description:"First day",activities:[{id:91,dayId:81,activityType:"ATTRACTION",locationName:"Saved landmark",latitude:13.7563,longitude:100.5018}]},{id:82,dayCount:2,dayDate:"2026-10-02",description:"Second day",activities:[{id:92,dayId:82,activityType:"ATTRACTION",locationName:"Next landmark",latitude:13.75,longitude:100.5}]}]});
async function setup(page,role="owner") {
 const trip=fixture(role),calls=[];let empty=false,fail=false;
 await page.addInitScript(()=>{localStorage.setItem("lang","en");localStorage.setItem("authState",JSON.stringify({state:{user:{id:1},token:"test"},version:0}));});
 await page.route("**/*tile*",r=>r.abort());
 await page.route("http://127.0.0.1:8899/api/**",async r=>{
  const path=new URL(r.request().url()).pathname,method=r.request().method();
  if(method==="OPTIONS")return r.fulfill({status:204,headers});
  let data=[];
  if(path==="/api/trips/71")data=trip;
  else if(path==="/api/activities/91/nearby"){
   const body=r.request().postDataJSON();calls.push({path,body});
   if(fail)return r.fulfill({status:503,headers,json:{message:"Provider unavailable"}});
   data={provider:"osm",ranking:"notability_distance",places:empty?[]:[{id:"node/1",name:"Riverside cafe",latitude:13.7565,longitude:100.5018,distanceMeters:200,rating:null,reviewCount:null,category:body.category}]};
  }else if(path==="/api/activities/91/nearby/add"){
   const body=r.request().postDataJSON();calls.push({path,body});
   const day=trip.days.find(d=>d.id===body.dayId),index=day.activities.findIndex(a=>a.id===body.anchorActivityId);
   data={id:100+calls.length,dayId:day.id,locationName:body.place.name,activityType:body.place.category==="hotel"?"ACCOMMODATION":"RESTAURANT",latitude:body.place.latitude,longitude:body.place.longitude,activityTime:null};
   day.activities.splice(body.placement==="end"?day.activities.length:index+(body.placement==="after"?1:0),0,data);
  }else if(path.includes("unread-count"))data=0;
  await r.fulfill({headers,json:{data}});
 });
 await page.goto("/trips/71");await page.getByRole("button",{name:/^Day 1/}).first().click();
 return {trip,calls,setEmpty:v=>{empty=v;},setFail:v=>{fail=v;}};
}
test("nearby panel is collapsed, filters search on demand and inserts into selected day and position",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 const {calls}=await setup(page);
 const panel=page.locator(".nearby-places").first();
 await expect(panel).not.toHaveAttribute("open");expect(calls).toHaveLength(0);
 await panel.locator("summary").click();
 await panel.getByLabel("Search radius").selectOption("5");
 await panel.getByLabel("Place category").selectOption("restaurant");
 await panel.getByLabel("Number of places").selectOption("3");
 expect(calls).toHaveLength(0);
 await panel.getByRole("button",{name:"Find nearby places"}).click();
 await expect(panel.getByText("Riverside cafe",{exact:true})).toBeVisible();
 expect(calls[0].body).toMatchObject({radiusKm:5,limit:3,category:"restaurant",latitude:13.7563,longitude:100.5018});
 await expect(panel.getByRole("link",{name:"Open Google Maps"})).toHaveAttribute("href",/google\.com\/maps\/search/);
 await panel.getByRole("button",{name:"Add to itinerary",exact:true}).click();
 await panel.getByLabel("Trip day").selectOption("82");
 await panel.getByLabel("Position in itinerary").selectOption("before:92");
 await panel.screenshot({path:test.info().outputPath("nearby-panel.png")});
 const overflow=await panel.evaluate(el=>el.scrollWidth>el.clientWidth+1);expect(overflow).toBe(false);
 await panel.locator("form").getByRole("button",{name:"Add to itinerary",exact:true}).click();
 await expect(panel.getByRole("status")).toContainText("Added");
 expect(calls[1].body).toMatchObject({dayId:82,placement:"before",anchorActivityId:92,place:{name:"Riverside cafe",category:"restaurant"}});
 await page.getByRole("button",{name:/^Day 2/}).first().click();
 const names=await page.locator(".nearby-places").evaluateAll(els=>els.map(el=>el.previousElementSibling.textContent));
 expect(names[0]).toContain("Riverside cafe");expect(names[1]).toContain("Next landmark");
 await page.reload();await page.getByRole("button",{name:/^Day 1/}).first().click();
 await panel.locator("summary").click();await panel.getByRole("button",{name:"Find nearby places"}).click();
 await panel.getByRole("button",{name:"Add to itinerary",exact:true}).click();
 await expect(panel.getByLabel("Position in itinerary")).toHaveValue("end");
 await panel.locator("form").getByRole("button",{name:"Add to itinerary",exact:true}).click();
 await expect(panel.getByRole("status")).toContainText("Added");
 expect(calls.at(-1).body).toMatchObject({dayId:81,placement:"end",anchorActivityId:null});
 expect(errors).toEqual([]);
});
test("nearby empty/error states retry and viewers have no add action",async({page})=>{
 const state=await setup(page,"viewer"),panel=page.locator(".nearby-places").first();
 await panel.locator("summary").click();state.setFail(true);
 await panel.getByRole("button",{name:"Find nearby places"}).click();
 await expect(panel.getByRole("alert")).toContainText("Please try again");
 state.setFail(false);state.setEmpty(true);
 await panel.getByRole("button",{name:"Find nearby places"}).click();
 await expect(panel.getByRole("status")).toContainText("No places found");
 state.setEmpty(false);await panel.getByRole("button",{name:"Find nearby places"}).click();
 await expect(panel.getByText("Riverside cafe",{exact:true})).toBeVisible();
 await expect(panel.getByRole("button",{name:"Add to itinerary",exact:true})).toHaveCount(0);
 await expect(panel.getByText("Only the owner or an editor",{exact:false})).toBeVisible();
});

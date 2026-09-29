import { test, expect } from "@playwright/test";

const headers={"access-control-allow-origin":"http://127.0.0.1:5188","access-control-allow-credentials":"true","access-control-allow-headers":"content-type,authorization","access-control-allow-methods":"GET,POST,PUT,DELETE,OPTIONS"};

test("friends chat, location request and consented timed sharing",async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem("lang","en");
    localStorage.setItem("authState",JSON.stringify({state:{user:{id:1,username:"Traveler",email:"traveler@example.com"},token:"test"},version:0}));
    Object.defineProperty(navigator,"geolocation",{value:{getCurrentPosition:callback=>callback({coords:{latitude:35.68,longitude:139.76,accuracy:12}}),watchPosition:()=>1,clearWatch:()=>{}}});
  });
  page.on("dialog",(dialog)=>dialog.accept());
  let sharingMinutes=null;let nextId=2;let friendRemoved=false;
  const messages=[{id:"1",kind:"location_request",body:"Location requested",senderId:2,senderName:"Friend",createdAt:new Date().toISOString()}];
  const threads=[{id:7,name:"Japan trip",participants:[{id:2,username:"Friend"}],lastMessage:null}];
  await page.route("http://127.0.0.1:8899/api/**",async(route)=>{
    const request=route.request();if(request.method()==="OPTIONS")return route.fulfill({status:204,headers});
    const url=new URL(request.url());const path=url.pathname;
    let data=[];
    if(path.endsWith("/social/friends/2")&&request.method()==="DELETE"){friendRemoved=true;data={removed:true};}
    else if(path.endsWith("/social/friends"))data=friendRemoved?[]:[{id:2,username:"Friend",requestedBy:1,status:"accepted"}];
    else if(path.endsWith("/social/conversations")&&request.method()==="GET")data=threads;
    else if(path.endsWith("/social/conversations")&&request.method()==="POST")data={id:7,name:"Japan trip"};
    else if(path.endsWith("/messages")&&request.method()==="GET")data=url.searchParams.get("after")==="0"?messages:messages.filter(m=>BigInt(m.id)>BigInt(url.searchParams.get("after")||"0"));
    else if(path.endsWith("/messages")&&request.method()==="POST"){
      const body=request.postDataJSON().body;const row={id:String(nextId++),kind:"text",body,senderId:1,senderName:"Traveler",createdAt:new Date().toISOString()};messages.push(row);data=row;
    }else if(path.endsWith("/location-requests")&&request.method()==="POST")data={id:"9",kind:"location_request"};
    else if(path.endsWith("/locations"))data=[{userId:2,username:"Friend",latitude:35.68,longitude:139.76,updatedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+3600000).toISOString()}];
    else if(path.endsWith("/location-shares")&&request.method()==="GET")data=null;
    else if(path.endsWith("/location-shares")&&request.method()==="POST"){
      sharingMinutes=request.postDataJSON().minutes;data={expiresAt:new Date(Date.now()+sharingMinutes*60000).toISOString()};
    }else if(path.endsWith("/location"))data={updated:true};
    else if(path.endsWith("/me"))data={username:"Traveler",email:"traveler@example.com"};
    return route.fulfill({headers,json:{data}});
  });
  await page.goto("/chat");
  await expect(page.getByRole("heading",{name:"Friends & chat"})).toBeVisible();
  await expect(page.getByTitle("Friend · Open map")).toBeVisible();
  await expect(page.getByRole("link",{name:/Open map/}).first()).toHaveAttribute("href",/google\.com\/maps/);
  await expect(page.getByText("Location requested · sharing is always your choice")).toBeVisible();
  await page.getByRole("button",{name:"Share location",exact:true}).first().click();
  await expect.poll(()=>sharingMinutes).toBe(60);
  await expect(page.getByText("Sharing location",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Stop sharing"}).click();
  await page.getByRole("button",{name:"Request location"}).click();
  await page.getByRole("textbox",{name:"Write a message…"}).fill("Meet at the station");
  await page.getByRole("button",{name:"Send"}).click();
  await expect(page.getByText("Meet at the station")).toBeVisible();
  await page.getByRole("button",{name:"Remove friend Friend"}).click();
  await expect.poll(()=>friendRemoved).toBe(true);
  await expect(page.getByText("No accepted friends yet")).toBeVisible();
  await page.goto("/dashboard");
  const dock=page.getByRole("button",{name:"Open chat"});
  const start=await dock.boundingBox();
  await page.mouse.move(start.x+start.width/2,start.y+start.height/2);
  await page.mouse.down();
  await page.mouse.move(36,36,{steps:8});
  await page.mouse.up();
  await expect.poll(async()=>page.evaluate(()=>localStorage.getItem("chat-dock-corner"))).toBe("top-left");
  await dock.click();
  await expect(page.getByRole("link",{name:"Full chat page"})).toBeVisible();
  const panel=await page.getByRole("region",{name:"Chat"}).boundingBox();
  expect(panel.x).toBeGreaterThanOrEqual(0);
  expect(panel.y).toBeGreaterThanOrEqual(0);
  await page.reload();
  await expect.poll(async()=>page.evaluate(()=>localStorage.getItem("chat-dock-corner"))).toBe("top-left");
  const restored=await page.getByRole("button",{name:"Open chat"}).boundingBox();
  expect(restored.x).toBeLessThan(100);
  expect(restored.y).toBeLessThan(100);
});

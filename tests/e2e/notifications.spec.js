import { test, expect } from "@playwright/test";

const headers={"access-control-allow-origin":"http://127.0.0.1:5188","access-control-allow-credentials":"true","access-control-allow-headers":"content-type,authorization","access-control-allow-methods":"GET,POST,PUT,PATCH,DELETE,OPTIONS"};

test("notification inbox accepts friend requests and opens new messages",async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem("lang","en");
    localStorage.setItem("navigationMode","classic");
    localStorage.setItem("authState",JSON.stringify({state:{user:{id:1,username:"Traveler",email:"traveler@example.com"},token:"test"},version:0}));
  });
  let accepted=false;let items=[
    {id:"11",type:"friend_request",actorId:2,actorName:"Friend",createdAt:new Date().toISOString(),readAt:null,payload:{}},
    {id:"12",type:"new_message",actorId:2,actorName:"Friend",createdAt:new Date().toISOString(),readAt:null,payload:{conversationId:"7",excerpt:"Meet at the station"}},
  ];
  await page.route("http://127.0.0.1:8899/api/**",async(route)=>{
    const req=route.request();if(req.method()==="OPTIONS")return route.fulfill({status:204,headers});
    const url=new URL(req.url());const path=url.pathname;let data=[];
    if(path.endsWith("/social/notifications")&&req.method()==="GET")data={items,unreadCount:items.filter(x=>!x.readAt).length};
    else if(path.endsWith("/social/notifications/unread-count"))data=items.filter(x=>!x.readAt).length;
    else if(path.endsWith("/social/friends")&&req.method()==="GET")data=[{id:2,username:"Friend",requestedBy:2,status:accepted?"accepted":"pending"}];
    else if(path.endsWith("/social/friends/2/accept")){accepted=true;items[0].readAt=new Date().toISOString();items[0].payload.accepted=true;data={accepted:true};}
    else if(path.endsWith("/social/conversations")&&req.method()==="GET")data=[{id:7,name:null,participants:[{id:2,username:"Friend"}],lastMessage:null}];
    else if(path.endsWith("/conversations/7/messages"))data=[{id:"1",kind:"text",body:"Meet at the station",senderId:2,senderName:"Friend",createdAt:new Date().toISOString()}];
    else if(path.endsWith("/conversations/7/locations"))data=[];
    else if(path.endsWith("/conversations/7/location-shares"))data=null;
    else if(path.endsWith("/notifications/conversations/7/read")){items[1].readAt=new Date().toISOString();data={read:true};}
    else if(path.endsWith("/notifications/11/read"))data={read:true};
    else if(path.endsWith("/me"))data={username:"Traveler",email:"traveler@example.com"};
    return route.fulfill({headers,json:{data}});
  });
  await page.goto("/dashboard");
  const appHeader=page.locator("header.navbar").first();
  const headerBell=appHeader.getByTestId("header-notifications");
  await expect(headerBell).toBeVisible();
  await expect(headerBell).toContainText("2");
  await expect(appHeader.getByRole("combobox",{name:"Language"})).toBeVisible();
  if (page.viewportSize().width >= 768) await expect(appHeader.getByRole("button",{name:/Traveler/})).toBeVisible();
  await expect(appHeader.getByRole("button",{name:/log out/i})).toBeVisible();
  await headerBell.click();
  await expect(page).toHaveURL(/\/notifications$/);
  await expect(page.getByText("Friend sent you a friend request")).toBeVisible();
  const pageMain = await page.locator("main.social-ui").boundingBox();
  expect(Math.abs(pageMain.x + pageMain.width - page.viewportSize().width)).toBeLessThanOrEqual(2);
  await page.screenshot({path:test.info().outputPath("notifications-ui.png"),fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button",{name:"Accept friend"}).click();
  await expect.poll(()=>accepted).toBe(true);
  await page.getByRole("button",{name:"Open chat",exact:true}).first().click();
  await expect(page).toHaveURL(/\/chat\?conversationId=7/);
  await expect(page.getByText("Meet at the station")).toBeVisible();
});

test("existing trip invitations appear in the bell and inbox; accept, decline and refresh", async ({page}) => {
  await page.addInitScript(() => {
    localStorage.setItem("lang", "en");
    localStorage.setItem("navigationMode", "classic");
    localStorage.setItem("authState", JSON.stringify({state:{user:{id:2,username:"Guest"},token:"test"},version:0}));
  });
  const invitation = (tripId) => ({tripId,role:"editor",trip:{tripName:`Shared trip ${tripId}`,destination:"Bangkok",user:{username:"Owner"}}});
  let pending = [invitation(71), invitation(72)];
  const responses = [];
  await page.route("http://127.0.0.1:8899/api/**", async (route) => {
    const req = route.request(), path = new URL(req.url()).pathname;
    if(req.method()==="OPTIONS") return route.fulfill({status:204,headers});
    let data = [];
    if(path === "/api/collaboration/invitations") data = pending;
    else if(path.startsWith("/api/collaboration/invitations/") && req.method()==="PUT") {
      const id=Number(path.split("/").at(-1));
      responses.push({id,...req.postDataJSON()});
      pending=pending.filter(row=>row.tripId!==id);
      data={tripId:id,status:req.postDataJSON().accepted?"accepted":"declined"};
    } else if(path === "/api/social/notifications/unread-count") data=0;
    else if(path === "/api/social/notifications") data={items:[],unreadCount:0};
    else if(path === "/api/trips/71") data={id:71,tripName:"Shared trip 71",destination:"Bangkok",accessRole:"editor",days:[]};
    await route.fulfill({headers,json:{data}});
  });
  await page.goto("/dashboard");
  await expect(page.getByTestId("header-notifications")).toContainText("2");
  await page.getByTestId("header-notifications").click();
  const invitations=page.locator('section[aria-labelledby="trip-invitations-heading"]');
  await expect(invitations.getByText("Shared trip 71")).toBeVisible();
  await expect(page.getByText("You're all caught up")).toHaveCount(0);
  await invitations.locator("article").filter({hasText:"Shared trip 72"}).getByRole("button",{name:"Decline",exact:true}).click();
  await expect.poll(()=>responses).toContainEqual({id:72,accepted:false});
  await expect(invitations.getByText("Shared trip 72")).toHaveCount(0);
  await invitations.getByRole("button",{name:"Accept",exact:true}).click();
  await expect(page).toHaveURL(/\/trips\/71$/);
  expect(responses).toContainEqual({id:71,accepted:true});
  await page.goto("/dashboard");
  await expect(page.getByTestId("header-notifications")).not.toContainText("2");
  pending=[invitation(73)];
  await page.evaluate(()=>window.dispatchEvent(new Event("focus")));
  await expect(page.getByText("Shared trip 73")).toBeVisible();
  await expect(page.getByTestId("header-notifications")).toContainText("1");
});

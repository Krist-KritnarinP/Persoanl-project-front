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
  await page.getByRole("button",{name:"Accept friend"}).click();
  await expect.poll(()=>accepted).toBe(true);
  await page.getByRole("button",{name:"Open chat",exact:true}).first().click();
  await expect(page).toHaveURL(/\/chat\?conversationId=7/);
  await expect(page.getByText("Meet at the station")).toBeVisible();
});

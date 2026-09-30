import {test,expect} from '@playwright/test';

test('notebook theme keeps readable colors, stable controls and responsive dashboard',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('lang','th');
    localStorage.setItem('authState',JSON.stringify({state:{user:{id:1,username:'Traveler'},token:'test'},version:0}));
  });
  await page.route('http://127.0.0.1:8899/api/**',route=>{
    const path=new URL(route.request().url()).pathname;
    const data=path==='/api/trips'?[{id:71,tripName:'วันพักผ่อนที่เชียงใหม่',destination:'เชียงใหม่',accessRole:'owner',startDate:'2026-11-01',endDate:'2026-11-03',totalDays:3,tripDescription:'กาแฟดี ๆ เดินเล่นในเมือง แล้วขึ้นดอยกับเพื่อน'}]:path.endsWith('unread-count')?0:[];
    return route.fulfill({headers:{'access-control-allow-origin':'http://127.0.0.1:5188','access-control-allow-credentials':'true'},json:{data}});
  });
  await page.goto('/dashboard');
  await expect(page.getByText('วันพักผ่อนที่เชียงใหม่',{exact:true})).toBeVisible();
  for(const theme of ['liquid-glass','liquid-glass-dark']){
    await page.locator('html').evaluate((el,value)=>el.dataset.theme=value,theme);
    const contrast=await page.evaluate(()=>{
      const style=getComputedStyle(document.documentElement);
      const luminance=hex=>{
        const rgb=hex.trim().slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
        return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
      };
      return [['--color-base-content','--surface-paper'],['--muted-ink','--surface-paper'],['--muted-ink','--page-paper'],['--color-primary-content','--color-primary']].map(([a,b])=>{
        const x=luminance(style.getPropertyValue(a)),y=luminance(style.getPropertyValue(b));
        return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
      });
    });
    for(const ratio of contrast) expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await expect(page.locator('.dashboard-welcome')).toHaveCSS('backdrop-filter','none');
    const button=page.locator('.dashboard-welcome .btn-primary');
    await button.focus();
    await expect(button).toHaveCSS('outline-style','solid');
    await page.screenshot({path:test.info().outputPath(`dashboard-${theme}.png`),fullPage:true});
  }
});

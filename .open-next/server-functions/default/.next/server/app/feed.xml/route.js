(()=>{var e={};e.id=7608,e.ids=[7608],e.modules={467:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>b,routeModule:()=>x,serverHooks:()=>$,workAsyncStorage:()=>y,workUnitAsyncStorage:()=>h});var i={};r.r(i),r.d(i,{GET:()=>f,dynamic:()=>c});var o=r(96559),s=r(48088),a=r(37719),n=r(32190),l=r(61223),p=r(44999);let c="force-dynamic";function u(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}let d=null,g=null,_=new Map,m=[/Googlebot/i,/Google-InspectionTool/i,/GoogleMerchant/i,/FeedFetcher-Google/i,/AdsBot-Google/i,/APIs-Google/i,/Mediapartners-Google/i];async function f(e){let t=Date.now();if(d&&g&&t-g<36e5)return new n.NextResponse(d,{status:200,headers:{"Content-Type":"application/xml","Cache-Control":"public, max-age=3600, stale-while-revalidate=86400"}});let r=e.headers.get("user-agent"),i=e.headers.get("x-forwarded-for")||e.headers.get("x-real-ip")||"unknown";if(!(r&&m.some(e=>e.test(r)))){let e=_.get(i)||{count:0,windowStart:t};if(t-e.windowStart>36e5&&(e.count=0,e.windowStart=t),e.count++,_.set(i,e),e.count>10)return new n.NextResponse("Rate limit exceeded. Please try again later.",{status:429,headers:{"Retry-After":"3600","Content-Type":"text/plain"}})}let o=(0,p.UL)(),s=(0,l.createServerComponentClient)({cookies:()=>o}),{data:a,error:c}=await s.from("categories").select("id, name");if(c)return new n.NextResponse(`Error fetching categories: ${c.message||JSON.stringify(c)}`,{status:500});let f=new Map(a.map(e=>[e.id,e.name])),{data:x,error:y}=await s.from("product_categories").select("product_id, category_id");if(y)return new n.NextResponse(`Error fetching product-category relations: ${y.message||JSON.stringify(y)}`,{status:500});let h=new Map;x.forEach(e=>{h.has(e.product_id)||h.set(e.product_id,[]),e.category_id&&h.get(e.product_id).push(e.category_id)});let{data:$,error:b}=await s.from("product_image_versions").select("product_id, feed_image_url"),k=new Map;for(let e of $||[])e.product_id&&e.feed_image_url&&(k.has(e.product_id)||k.set(e.product_id,[]),k.get(e.product_id).push(e.feed_image_url));let{data:v,error:w}=await s.from("products").select("id, name, description, price, compare_at_price, images, slug, status, stock, google_product_category, sizes, is_published").eq("is_published",!0);if(w)return new n.NextResponse(`Error fetching products: ${w.message||JSON.stringify(w)}`,{status:500});let S=(v||[]).flatMap(e=>{var t,r;let i=function(e,t){let r=k.get(e);return r&&r.length>0?r.map(e=>`${process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BASE||"https://tafojbtftmihrheeyoky.supabase.co"}/storage/v1/object/public/product-images/${e}`):Array.isArray(t)&&t.length>0?t.map(e=>{let t="string"==typeof e?e:e?.url;return t?`${process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BASE||"https://tafojbtftmihrheeyoky.supabase.co"}/storage/v1/object/public/product-images/${t}`:null}).filter(e=>!!e):[]}(e.id,e.images),o=`https://toto.co.ke/products/${e.slug}`,s=(t=e.status,"number"==typeof(r=e.stock)?r>0?"in stock":"out of stock":"string"==typeof t&&"active"===t.toLowerCase()?"in stock":"out of stock"),a=e.google_product_category||"",n=h.get(e.id)||[],l="";if(n.length>0){let e=n[0];l=f.get(e)||""}let p="number"==typeof e.price?e.price:0,c=p,d=null;null!==e.compare_at_price&&e.compare_at_price>p&&(c=e.compare_at_price,d=p);let g=Array.isArray(e.sizes)?e.sizes.filter(e=>e&&"object"==typeof e):[];return g.length>0?g.map(t=>{let r=t.label||t.value||"",n=t.value||t.label||"",c="number"==typeof t.price?t.price:p,d=c,g=null;null!==e.compare_at_price&&e.compare_at_price>c&&(d=e.compare_at_price,g=c);let _=String(n).replace(/[^a-zA-Z0-9\-]/g,"_"),m=`${e.id}-${_}`,f=`${e.name} - ${r}`;return`
    <item>
      <g:id>${u(m)}</g:id>
      <g:item_group_id>${u(e.id)}</g:item_group_id>
      <g:title>${u(f)}</g:title>
      <g:description>${u(e.description||"")}</g:description>
      <g:link>${u(o)}</g:link>
      <g:image_link>${u(i[0]||"")}</g:image_link>
${i.slice(1).map(e=>`      <g:additional_image_link>${u(e||"")}</g:additional_image_link>`).join("\n")}
      <g:availability>${s}</g:availability> { /* TODO: Check sizeVariant.available? */ }
      <g:price>${d.toFixed(2)} KES</g:price>
      ${null!==g?`<g:sale_price>${g.toFixed(2)} KES</g:sale_price>`:""}
      <g:condition>new</g:condition>
      <g:brand>${u("Toto Toys & Fun")}</g:brand>
      <g:size>${u(n)}</g:size>
      <g:product_type>${u(a)}</g:product_type>
      ${l?`<g:custom_label_0>${u(l)}</g:custom_label_0>`:""}
      <g:identifier_exists>no</g:identifier_exists>
    </item>`}):`
    <item>
      <g:id>${u(e.id)}</g:id>
      {/* No item_group_id for non-variant products */}
      <g:title>${u(e.name)}</g:title>
      <g:description>${u(e.description||"")}</g:description>
      <g:link>${u(o)}</g:link>
      <g:image_link>${u(i[0]||"")}</g:image_link>
${i.slice(1).map(e=>`      <g:additional_image_link>${u(e||"")}</g:additional_image_link>`).join("\n")}
      <g:availability>${s}</g:availability>
      <g:price>${c.toFixed(2)} KES</g:price>
      ${null!==d?`<g:sale_price>${d.toFixed(2)} KES</g:sale_price>`:""}
      <g:condition>new</g:condition>
      <g:brand>${u("Toto Toys & Fun")}</g:brand>
      {/* No size tag for non-variant products */}
      <g:product_type>${u(a)}</g:product_type>
      ${l?`<g:custom_label_0>${u(l)}</g:custom_label_0>`:""}
      <g:identifier_exists>no</g:identifier_exists>
    </item>`}).join("\n"),A=`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Toto Toys &amp; Fun Product Feed</title>
    <link>https://toto.co.ke</link> {/* Temporarily hardcoded link */}
    <description>Live product feed for Google Shopping</description>
${S}
  </channel>
</rss>`;return d=A,g=t,new n.NextResponse(A,{status:200,headers:{"Content-Type":"application/xml","Cache-Control":"public, max-age=3600, stale-while-revalidate=86400"}})}let x=new o.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/feed.xml/route",pathname:"/feed.xml",filename:"route",bundlePath:"app/feed.xml/route"},resolvedPagePath:"C:\\Projects\\toto-minimalist\\src\\app\\feed.xml\\route.ts",nextConfigOutput:"standalone",userland:i}),{workAsyncStorage:y,workUnitAsyncStorage:h,serverHooks:$}=x;function b(){return(0,a.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:h})}},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11997:e=>{"use strict";e.exports=require("punycode")},27910:e=>{"use strict";e.exports=require("stream")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},34631:e=>{"use strict";e.exports=require("tls")},39727:()=>{},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},47990:()=>{},51906:e=>{function t(e){var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=51906,e.exports=t},55511:e=>{"use strict";e.exports=require("crypto")},55591:e=>{"use strict";e.exports=require("https")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74075:e=>{"use strict";e.exports=require("zlib")},78335:()=>{},79428:e=>{"use strict";e.exports=require("buffer")},79551:e=>{"use strict";e.exports=require("url")},81630:e=>{"use strict";e.exports=require("http")},91645:e=>{"use strict";e.exports=require("net")},94735:e=>{"use strict";e.exports=require("events")},96487:()=>{}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[4243,3605,580],()=>r(467));module.exports=i})();
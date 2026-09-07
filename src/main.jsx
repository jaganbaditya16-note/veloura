import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Heart, Menu, Minus, Plus, Search, ShoppingBag, Sparkles, Truck, X, ShieldCheck, RotateCcw } from 'lucide-react';
import './styles.css';
import { fetchProducts } from './lib/catalog';
import { supabaseConfigured } from './lib/supabase';

const DEMO_PRODUCTS = [
  { id: 1, slug:'essential-overshirt', name:'Essential Overshirt', price:12900, category:'Outerwear', color:'Stone', sizes:['S','M','L','XL'], image:'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=88', badge:'Best seller', description:'A structured everyday overshirt cut from a soft, substantial cotton blend. Designed to layer from morning to late evening.' },
  { id: 2, slug:'relaxed-cotton-tee', name:'Relaxed Cotton Tee', price:6800, category:'Tops', color:'Ivory', sizes:['XS','S','M','L','XL'], image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=88', description:'A clean, relaxed silhouette in heavyweight organic cotton with a soft hand feel.' },
  { id: 3, slug:'tailored-wide-trousers', name:'Tailored Wide Trousers', price:14800, category:'Bottoms', color:'Charcoal', sizes:['28','30','32','34','36'], image:'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=88', badge:'New', description:'A high-rise, wide-leg trouser with a fluid drape and a precise tailored finish.' },
  { id: 4, slug:'merino-knit-polo', name:'Merino Knit Polo', price:11800, category:'Knitwear', color:'Espresso', sizes:['S','M','L','XL'], image:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=88', description:'Fine merino knit with a softly structured collar and a refined, easy fit.' },
  { id: 5, slug:'studio-denim', name:'Studio Denim', price:15600, category:'Denim', color:'Indigo', sizes:['28','30','32','34','36'], image:'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=88', description:'A straight, mid-rise denim cut from rigid indigo cotton that softens beautifully with wear.' },
  { id: 6, slug:'minimal-wool-coat', name:'Minimal Wool Coat', price:29500, category:'Outerwear', color:'Oat', sizes:['S','M','L','XL'], image:'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?auto=format&fit=crop&w=1200&q=88', badge:'Limited', description:'A longline wool coat with clean lapels, hidden fastening and a generous silhouette.' },
  { id: 7, slug:'everyday-oxford', name:'Everyday Oxford', price:9600, category:'Tops', color:'Sky', sizes:['S','M','L','XL'], image:'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=88', description:'Crisp Oxford cotton, softened through a relaxed body and curved hem.' },
  { id: 8, slug:'ribbed-long-sleeve', name:'Ribbed Long Sleeve', price:8200, category:'Tops', color:'Black', sizes:['XS','S','M','L'], image:'https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=1200&q=88', description:'A close but comfortable ribbed jersey layer made for effortless everyday dressing.' },
  { id: 9, slug:'linen-shirt', name:'Linen Shirt', price:249900, category:'Tops', color:'Natural', sizes:['S','M','L','XL'], image:'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=88', badge:'New', description:'A breathable linen shirt with an easy silhouette for warm-weather dressing.' }
];
const CATEGORIES=['All','Tops','Bottoms','Outerwear','Knitwear','Denim'];
const money = n => `₹${Math.round(n / 100).toLocaleString('en-IN')}`;
const read = (key, fallback=[]) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } };

function App(){
  const [menu,setMenu]=useState(false), [search,setSearch]=useState(''), [cat,setCat]=useState('All');
  const [cart,setCart]=useState(()=>read('veloura-cart')), [wishlist,setWishlist]=useState(()=>read('veloura-wishlist'));
  const [drawer,setDrawer]=useState(null), [selected,setSelected]=useState(null), [selectedSize,setSelectedSize]=useState(''), [toast,setToast]=useState('');
  const [newsletter,setNewsletter]=useState('');
  const [sort,setSort]=useState('featured');
  const [heroIndex,setHeroIndex]=useState(0);
  const [products,setProducts]=useState(DEMO_PRODUCTS);
  const [catalogError,setCatalogError]=useState('');

  useEffect(()=>{
    if(!supabaseConfigured) return;
    let cancelled=false;
    fetchProducts().then(({data,error})=>{
      if(cancelled) return;
      if(error){ setCatalogError('Could not load the live catalogue. Showing demo products.'); return; }
      if(Array.isArray(data) && data.length){ setProducts(data); setCatalogError(''); }
    }).catch(()=>{ if(!cancelled) setCatalogError('Could not load the live catalogue. Showing demo products.'); });
    return ()=>{cancelled=true};
  },[]);

  useEffect(()=>localStorage.setItem('veloura-cart',JSON.stringify(cart)),[cart]);
  useEffect(()=>localStorage.setItem('veloura-wishlist',JSON.stringify(wishlist)),[wishlist]);
  useEffect(()=>{ document.body.style.overflow = drawer || selected ? 'hidden' : ''; return ()=>document.body.style.overflow='' },[drawer,selected]);

  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();
    const result=products.filter(p=>(cat==='All'||p.category===cat)&&(!q||`${p.name} ${p.category} ${p.color}`.toLowerCase().includes(q)));
    return [...result].sort((a,b)=>sort==='price-low'?a.price-b.price:sort==='price-high'?b.price-a.price:0);
  },[products,cat,search,sort]);
  const count=cart.reduce((a,i)=>a+i.qty,0), subtotal=cart.reduce((a,i)=>a+i.price*i.qty,0), shipping=subtotal>=1500000||subtotal===0?0:12000, total=subtotal+shipping;
  const notify=m=>{setToast(m);window.clearTimeout(window.__vtoast);window.__vtoast=window.setTimeout(()=>setToast(''),2200)};
  const add=(product,size=product.sizes[0])=>{ setCart(c=>{const key=`${product.id}-${size}`;const old=c.find(i=>i.key===key);return old?c.map(i=>i.key===key?{...i,qty:i.qty+1}:i):[...c,{...product,size,key,qty:1}]}); notify(`${product.name} added to bag`); };
  const change=(key,delta)=>setCart(c=>c.map(i=>i.key===key?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0));
  const toggleWish=id=>setWishlist(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id]);
  const openProduct=p=>{setSelected(p);setSelectedSize(p.sizes[0])};

  return <div className="app">
    <div className="announcement"><Sparkles size={12}/> Complimentary shipping on orders over ₹15,000 <span>·</span> Easy 30-day returns</div>
    <header className="site-header"><button className="icon mobile" aria-label="Open menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button><a className="logo" href="#top" onClick={()=>setMenu(false)}>VELOURA</a>
      <nav className={menu?'open':''}>{[['Shop','#shop'],['Story','#story'],['Journal','#journal'],['Contact','#contact']].map(([t,h])=><a key={t} href={h} onClick={()=>setMenu(false)}>{t}</a>)}</nav>
      <div className="actions"><label className="search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search pieces" aria-label="Search products"/></label>
        <button className="icon count-button" aria-label="Wishlist" onClick={()=>setDrawer('wishlist')}><Heart size={19} fill={wishlist.length?'currentColor':'none'}/>{wishlist.length>0&&<b>{wishlist.length}</b>}</button>
        <button className="bag" onClick={()=>setDrawer('cart')} aria-label="Open shopping bag"><ShoppingBag size={19}/><span>Bag</span>{count>0&&<b>{count}</b>}</button>
      </div>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy"><p className="eyebrow">AUTUMN / WINTER 2026</p><h1>Quietly bold.<br/><i>Made to last.</i></h1><p>Refined everyday clothing with considered fabrics, clean silhouettes and zero unnecessary noise.</p><div className="hero-actions"><a className="btn dark" href="#shop">Shop collection <ArrowRight size={16}/></a><span className="microcopy">Small-batch / considered / everyday</span></div></div>
        <div className="hero-visual"><div className="hero-glow"/><img key={heroIndex} src={['https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=90','https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=90','https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=90'][heroIndex]} alt="Veloura autumn winter collection"/><div className="hero-switch"><button onClick={()=>setHeroIndex(i=>(i+2)%3)} aria-label="Previous image"><ChevronLeft/></button><span>0{heroIndex+1} / 03</span><button onClick={()=>setHeroIndex(i=>(i+1)%3)} aria-label="Next image"><ChevronRight/></button></div></div>
      </section>
      <section className="values"><Value icon={<Truck/>} title="Complimentary delivery" text="On orders ₹15,000+"/><Value icon={<RotateCcw/>} title="30-day returns" text="Simple & stress-free"/><Value icon={<ShieldCheck/>} title="Quality guaranteed" text="Built for repeated wear"/></section>

      <section className="shop" id="shop"><div className="section-head"><div><p className="eyebrow">THE COLLECTION</p><h2>Essential pieces</h2></div><p className="muted">Nine considered staples. Designed to move through your week.</p></div>
        <div className="shop-toolbar"><div className="filters">{CATEGORIES.map(x=><button className={cat===x?'active':''} onClick={()=>setCat(x)} key={x}>{x}</button>)}</div><label className="sort">Sort <ChevronDown size={14}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>
        <div className="grid">{filtered.map(p=><ProductCard key={p.id} p={p} liked={wishlist.includes(p.id)} onWish={()=>toggleWish(p.id)} onOpen={()=>openProduct(p)} onAdd={()=>add(p)}/>)}</div>{!filtered.length&&<div className="empty"><Search size={25}/><strong>No pieces found</strong><span>Try another search or collection.</span><button className="text-link" onClick={()=>{setSearch('');setCat('All')}}>Reset filters <ArrowRight size={15}/></button></div>}
      </section>

      <section className="manifesto"><div className="manifesto-copy"><p className="eyebrow">THE VELOURA STANDARD</p><h2>Good design should disappear into your life.</h2><p>We build clothes around repeat wear: natural textures, purposeful details and silhouettes that feel relevant long after the season ends.</p><a className="text-link" href="#story">Discover our philosophy <ArrowRight size={15}/></a></div><div className="manifesto-orbit"><div className="orbit-ring ring-a"/><div className="orbit-ring ring-b"/><div className="orbit-core">V<br/><span>26</span></div></div></section>

      <section className="story" id="story"><div className="story-image"><img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=88" alt="Veloura editorial portrait"/></div><div className="story-copy"><p className="eyebrow">OUR PHILOSOPHY</p><h2>Less, but better.</h2><p>Veloura began with a simple idea: the clothes you reach for most should be the ones made with the most care.</p><p>We work in small, intentional collections, choosing durable construction and silhouettes that outlive a season.</p><a className="text-link" href="#contact">Read our story <ArrowRight size={15}/></a></div></section>

      <section className="journal" id="journal"><div className="section-head"><div><p className="eyebrow">FROM THE JOURNAL</p><h2>Notes on getting dressed</h2></div><a className="text-link" href="#journal">View all <ArrowRight size={15}/></a></div><div className="journal-grid"><Journal image="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1100&q=88" tag="STYLE / 06.09.26" title="The art of the everyday uniform"/><Journal image="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1100&q=88" tag="FABRIC / 01.09.26" title="Why we choose natural fibres"/><Journal image="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1100&q=88" tag="GUIDE / 26.08.26" title="Five pieces, twenty outfits"/></div></section>
      <section className="newsletter" id="contact"><p className="eyebrow">STAY IN THE LOOP</p><h2>Good clothes. No noise.</h2><p>New collections, journal notes and early access. Once or twice a month.</p><form onSubmit={e=>{e.preventDefault();if(!newsletter)return;notify('You’re on the list — welcome to Veloura.');setNewsletter('')}}><input required type="email" value={newsletter} onChange={e=>setNewsletter(e.target.value)} placeholder="Your email address"/><button>Subscribe <ArrowRight size={16}/></button></form></section>
    </main>

    <footer><div><a className="logo" href="#top">VELOURA</a><p>Modern essentials for a considered wardrobe.</p><div className="footer-note">Designed for repeat wear. Built with intention.</div></div><div className="footer-links"><div><strong>Shop</strong><a href="#shop">New arrivals</a><a href="#shop">Best sellers</a><a href="#shop">Essentials</a></div><div><strong>Help</strong><a href="#contact">Shipping</a><a href="#contact">Returns</a><a href="#contact">Size guide</a></div><div><strong>Connect</strong><a href="#contact">Instagram</a><a href="#contact">Pinterest</a><a href="#contact">Newsletter</a></div></div><div className="copyright">© 2026 Veloura. All rights reserved. <span>Secure checkout · Privacy · Terms</span></div></footer>

    {drawer&&<Drawer type={drawer} cart={cart} wishlist={wishlist} products={products} subtotal={subtotal} shipping={shipping} total={total} onClose={()=>setDrawer(null)} onChange={change} onOpenProduct={openProduct} onWish={toggleWish} onAdd={add} onCheckout={()=>notify('Checkout is ready for your payment provider.')}/>} 
    {selected&&<ProductModal product={selected} size={selectedSize} setSize={setSelectedSize} onClose={()=>setSelected(null)} onAdd={()=>{add(selected,selectedSize);setSelected(null);setDrawer('cart')}} liked={wishlist.includes(selected.id)} onWish={()=>toggleWish(selected.id)}/>} 
    {toast&&<div className="toast"><Check size={15}/>{toast}</div>}
  </div>
}

function Value({icon,title,text}){return <div>{icon}<strong>{title}</strong><span>{text}</span></div>}
function ProductCard({p,liked,onWish,onOpen,onAdd}){return <article className="product"><button className="product-media" onClick={onOpen}><img src={p.image} alt={p.name}/>{p.badge&&<span className="badge">{p.badge}</span>}<span className="view-label">View piece <ArrowRight size={14}/></span></button><button className="heart" aria-label={`Wishlist ${p.name}`} onClick={onWish}><Heart size={18} fill={liked?'currentColor':'none'}/></button><div className="product-info"><button onClick={onOpen}><h3>{p.name}</h3><p>{p.color} · {p.category}</p></button><strong>{money(p.price)}</strong></div><button className="add-line" onClick={onAdd}>Add to bag <Plus size={14}/></button></article>}
function Journal({image,tag,title}){return <article className="journal-card"><img src={image} alt=""/><small>{tag}</small><h3>{title}</h3><a className="text-link" href="#contact">Read note <ArrowRight size={14}/></a></article>}
function Drawer({type,cart,wishlist,products,subtotal,shipping,total,onClose,onChange,onOpenProduct,onWish,onAdd,onCheckout}){const items=type==='wishlist'?products.filter(p=>wishlist.includes(p.id)):cart;return <><div className="overlay" onClick={onClose}/><aside className="drawer"><div className="drawer-head"><div><p className="eyebrow">VELOURA</p><h2>{type==='wishlist'?'Wishlist':'Your bag'} <span>{type==='wishlist'?`(${items.length})`:`(${cart.reduce((a,i)=>a+i.qty,0)})`}</span></h2></div><button className="icon" onClick={onClose}><X/></button></div>{items.length===0?<div className="bag-empty">{type==='wishlist'?<Heart size={36}/>:<ShoppingBag size={36}/>}<p>{type==='wishlist'?'Save pieces you love.':'Your bag is waiting.'}</p><button className="btn dark" onClick={onClose}>Continue shopping</button></div>:type==='wishlist'?<div className="wish-items">{items.map(p=><div className="wish-item" key={p.id}><img src={p.image} alt=""/><div><h3>{p.name}</h3><p>{money(p.price)}</p><button className="text-link" onClick={()=>{onAdd(p);onClose()}}>Add to bag <Plus size={14}/></button><button className="remove" onClick={()=>onWish(p.id)}>Remove</button></div></div>)}</div>:<><div className="cart-items">{cart.map(i=><div className="cart-item" key={i.key}><img src={i.image} alt=""/><div className="cart-detail"><h3>{i.name}</h3><p>{i.color} · {i.size}</p><strong>{money(i.price)}</strong><div className="qty"><button onClick={()=>onChange(i.key,-1)}><Minus size={13}/></button><span>{i.qty}</span><button onClick={()=>onChange(i.key,1)}><Plus size={13}/></button></div></div></div>)}</div><div className="checkout"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Shipping</span><strong>{shipping===0?'Complimentary':money(shipping)}</strong></div><div className="total"><span>Total</span><strong>{money(total)}</strong></div><p>Taxes are calculated at checkout. Payment credentials never belong in the frontend.</p><button className="btn dark full" onClick={onCheckout}>Secure checkout <ArrowRight size={16}/></button></div></>}</aside></>}
function ProductModal({product,size,setSize,onClose,onAdd,liked,onWish}){return <><div className="overlay" onClick={onClose}/><section className="product-modal"><button className="close-modal" onClick={onClose}><X/></button><div className="modal-image"><img src={product.image} alt={product.name}/></div><div className="modal-copy"><p className="eyebrow">{product.category} / {product.color}</p><h2>{product.name}</h2><strong className="modal-price">{money(product.price)}</strong><p>{product.description}</p><div className="size-label"><span>Size</span><span>Size guide</span></div><div className="sizes">{product.sizes.map(s=><button className={size===s?'selected':''} key={s} onClick={()=>setSize(s)}>{s}</button>)}</div><button className="btn dark full" onClick={onAdd}>Add to bag <ArrowRight size={16}/></button><button className="save-btn" onClick={onWish}><Heart size={17} fill={liked?'currentColor':'none'}/>{liked?'Saved to wishlist':'Save to wishlist'}</button><div className="detail-list"><span><Check size={15}/> Designed for repeat wear</span><span><Check size={15}/> Easy 30-day returns</span><span><Check size={15}/> Secure payment at checkout</span></div></div></section></>}

createRoot(document.getElementById('root')).render(<App/>);

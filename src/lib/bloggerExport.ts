// Blogger XML theme generator + posts -> Blogger Atom export
// Pure client-side helpers — no edge function needed.

export function generateBloggerTheme(opts: {
  title: string;
  description?: string;
  primaryColor?: string;
  bgColor?: string;
  fontHeading?: string;
  fontBody?: string;
}): string {
  const title = opts.title || "AHAiWEB";
  const description = opts.description || "Personal Blog";
  const primary = opts.primaryColor || "#dc2626";
  const bg = opts.bgColor || "#ffffff";
  const fHead = opts.fontHeading || "Playfair Display, serif";
  const fBody = opts.fontBody || "Noto Sans Bengali, sans-serif";

  return `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:defaultwidgetversion='2' b:layoutsVersion='3' b:responsive='true' b:templateVersion='1.3.0' expr:dir='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
<b:include data='blog' name='all-head-content'/>
<title><data:blog.pageTitle/></title>
<meta content='width=device-width, initial-scale=1' name='viewport'/>
<meta content='${description}' name='description'/>
<link href='https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&amp;family=Playfair+Display:wght@600;700;800;900&amp;display=swap' rel='stylesheet'/>
<b:skin><![CDATA[
/*!
Theme Name: ${title}
Description: ${description} — AHAiWEB News Portal + Creative
Author: AHAiWEB
*/
:root{
  --primary:${primary};
  --primary-dark:#991b1b;
  --bg:${bg};
  --fg:#0f172a;
  --muted:#64748b;
  --border:#e2e8f0;
  --card:#ffffff;
  --accent:#fef2f2;
  --radius:12px;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:${fBody};background:#f8fafc;color:var(--fg);line-height:1.75;font-size:15px}
h1,h2,h3,h4,h5{font-family:${fHead};margin:0 0 .5em;line-height:1.25;color:var(--fg)}
a{color:var(--primary);text-decoration:none;transition:color .2s}
a:hover{color:var(--primary-dark)}
img{max-width:100%;height:auto;display:block}
ul{list-style:none;padding:0;margin:0}

/* ========== TOP BAR ========== */
.topbar{background:var(--fg);color:#fff;font-size:12px;padding:6px 0}
.topbar .outer-wrapper{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.topbar a{color:#fff;opacity:.85}
.topbar a:hover{opacity:1;color:#fff}

/* ========== HEADER ========== */
.site-header{background:var(--card);border-bottom:3px solid var(--primary);padding:18px 0}
.outer-wrapper{max-width:1280px;margin:0 auto;padding:0 16px}
.header-inner{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.site-branding h1.title{font-size:2rem;color:var(--primary);margin:0;font-weight:800}
.site-branding h1.title a{color:inherit}
.site-branding .description{color:var(--muted);font-size:.85rem;margin:2px 0 0}
.header-search{flex:1;max-width:360px;display:flex;border:1px solid var(--border);border-radius:999px;overflow:hidden}
.header-search input{flex:1;border:0;padding:8px 14px;outline:none;font-family:inherit;background:transparent}
.header-search button{background:var(--primary);color:#fff;border:0;padding:0 16px;cursor:pointer}

/* ========== NAVIGATION ========== */
.main-nav{background:var(--primary);color:#fff;position:sticky;top:0;z-index:50;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.main-nav .outer-wrapper{display:flex;align-items:center;gap:4px;overflow-x:auto}
.main-nav .widget{margin:0;flex:1}
.main-nav ul{display:flex;flex-wrap:wrap;gap:0}
.main-nav ul li{padding:0;border:0}
.main-nav ul li a{display:block;color:#fff;padding:12px 16px;font-weight:600;font-size:.95rem;white-space:nowrap;border-right:1px solid rgba(255,255,255,.12)}
.main-nav ul li a:hover{background:var(--primary-dark);color:#fff}

/* ========== LAYOUT 3-COLUMN ========== */
.main-wrapper{display:grid;grid-template-columns:260px 1fr 300px;gap:20px;margin:20px 0}
@media (max-width: 1100px){.main-wrapper{grid-template-columns:1fr 280px}.left-sidebar{display:none}}
@media (max-width: 768px){.main-wrapper{grid-template-columns:1fr}.right-sidebar{order:2}}

.sidebar-wrapper{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;align-self:start}
.main-inner{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;min-height:400px}

/* ========== POSTS ========== */
.post{padding:0 0 24px;margin-bottom:24px;border-bottom:1px solid var(--border)}
.post:last-child{border-bottom:0;margin-bottom:0;padding-bottom:0}
.post h2.post-title,.post h3.post-title{font-size:1.6rem;margin-bottom:.4rem}
.post h2.post-title a,.post h3.post-title a{color:var(--fg)}
.post h2.post-title a:hover,.post h3.post-title a:hover{color:var(--primary)}
.post-header-line-1{color:var(--muted);font-size:.82rem;margin:.25rem 0 .75rem;display:flex;gap:10px;flex-wrap:wrap}
.post-header-line-1 span{display:inline-flex;align-items:center;gap:4px}
.post-body{font-size:1rem;line-height:1.85}
.post-body img{border-radius:var(--radius);margin:14px 0;width:100%}
.post-body p{margin:0 0 1em}
.post-body blockquote{border-left:4px solid var(--primary);background:var(--accent);padding:12px 16px;margin:1em 0;font-style:italic;border-radius:0 8px 8px 0}
.jump-link a{display:inline-block;margin-top:10px;background:var(--primary);color:#fff;padding:8px 16px;border-radius:8px;font-weight:600;font-size:.9rem}
.jump-link a:hover{background:var(--primary-dark);color:#fff;text-decoration:none}
.post-footer{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:12px;padding-top:12px;border-top:1px dashed var(--border);font-size:.85rem;color:var(--muted)}

/* ========== FEATURED / HERO SECTION ========== */
.featured-section{margin-bottom:20px}
.featured-section h2.section-title{font-size:1.1rem;color:var(--primary);border-bottom:2px solid var(--primary);padding-bottom:6px;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.featured-section h2.section-title::before{content:"";width:6px;height:18px;background:var(--primary);border-radius:2px;display:inline-block}

/* ========== WIDGETS / SIDEBAR ========== */
.widget{margin-bottom:20px}
.widget:last-child{margin-bottom:0}
.widget h2{font-size:1rem;color:#fff;background:var(--primary);padding:8px 12px;border-radius:6px 6px 0 0;margin:0 -16px 12px;letter-spacing:.02em}
.sidebar-wrapper .widget h2{margin:0 -16px 12px;padding-left:16px;padding-right:16px}
.widget-content{font-size:.92rem}
.widget ul li{padding:8px 0;border-bottom:1px dashed var(--border)}
.widget ul li:last-child{border-bottom:0}
.widget ul li a{color:var(--fg);font-weight:500}
.widget ul li a:hover{color:var(--primary)}

/* PopularPosts items */
.PopularPosts .item-thumbnail{float:left;margin-right:10px;width:64px;height:48px;overflow:hidden;border-radius:6px}
.PopularPosts .item-thumbnail img{width:100%;height:100%;object-fit:cover}
.PopularPosts ul li{display:flow-root;font-size:.9rem;line-height:1.4}

/* Label cloud */
.Label ul{display:flex;flex-wrap:wrap;gap:6px}
.Label ul li{border:0;padding:0}
.Label ul li a{background:var(--accent);color:var(--primary);padding:4px 10px;border-radius:999px;font-size:.82rem;display:inline-block}
.Label ul li a:hover{background:var(--primary);color:#fff}

/* ========== FOOTER ========== */
.site-footer{margin-top:32px;background:var(--fg);color:#cbd5e1;padding:32px 0 0}
.site-footer a{color:#fff}
.footer-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px}
.site-footer .widget h2{background:transparent;color:#fff;padding:0;margin:0 0 10px;border-bottom:1px solid rgba(255,255,255,.15);padding-bottom:6px}
.site-footer .widget ul li{border-color:rgba(255,255,255,.08)}
.site-footer .widget ul li a{color:#cbd5e1}
.site-footer .widget ul li a:hover{color:#fff}
.footer-bottom{margin-top:24px;padding:14px 0;text-align:center;color:#94a3b8;font-size:.85rem;border-top:1px solid rgba(255,255,255,.1)}

/* ========== PAGINATION ========== */
.blog-pager{text-align:center;padding:20px 0}
.blog-pager a{background:var(--primary);color:#fff;padding:10px 18px;border-radius:8px;display:inline-block;margin:0 4px;font-weight:600}
.blog-pager a:hover{background:var(--primary-dark);color:#fff;text-decoration:none}

/* ========== COMMENTS ========== */
.comments{margin-top:24px;padding-top:18px;border-top:2px solid var(--border)}
.comments h3{color:var(--primary)}
]]></b:skin>
<b:defaultmarkups>
<b:defaultmarkup type='Common'>
<b:includable id='main'><b:include name='widget'/></b:includable>
</b:defaultmarkup>
</b:defaultmarkups>
</head>
<body>

<!-- TOP BAR -->
<div class='topbar'>
  <div class='outer-wrapper'>
    <span>📅 <script>document.write(new Date().toLocaleDateString('bn-BD'))</script></span>
    <span><a expr:href='data:blog.homepageUrl'>হোম</a> · <a href='/p/about.html'>আমাদের সম্পর্কে</a> · <a href='/p/contact.html'>যোগাযোগ</a></span>
  </div>
</div>

<!-- HEADER -->
<header class='site-header'>
  <div class='outer-wrapper header-inner'>
    <b:section class='site-branding' id='header' maxwidgets='1' showaddelement='no'>
      <b:widget id='Header1' locked='true' title='${title}' type='Header' version='2'>
        <b:includable id='main'>
          <div class='site-branding'>
            <h1 class='title'><a expr:href='data:blog.homepageUrl'><data:title/></a></h1>
            <p class='description'><data:description/></p>
          </div>
        </b:includable>
      </b:widget>
    </b:section>
    <form class='header-search' expr:action='data:blog.searchUrl' method='get'>
      <input name='q' placeholder='অনুসন্ধান করুন...' type='search'/>
      <button type='submit'>🔍</button>
    </form>
  </div>
</header>

<!-- MAIN NAVIGATION -->
<nav class='main-nav'>
  <div class='outer-wrapper'>
    <b:section class='nav-section' id='nav-menu' maxwidgets='1' showaddelement='yes'>
      <b:widget id='LinkList1' locked='false' title='মেনু' type='LinkList' version='2'>
        <b:includable id='main'>
          <ul>
            <b:loop values='data:links' var='link'>
              <li><a expr:href='data:link.target'><data:link.name/></a></li>
            </b:loop>
          </ul>
        </b:includable>
      </b:widget>
    </b:section>
  </div>
</nav>

<!-- 3-COLUMN LAYOUT -->
<div class='outer-wrapper'>
  <div class='main-wrapper'>

    <!-- LEFT SIDEBAR -->
    <aside class='sidebar-wrapper left-sidebar'>
      <b:section class='sidebar' id='left-sidebar' preferred='yes' showaddelement='yes'>
        <b:widget id='PopularPosts1' locked='false' title='জনপ্রিয় পোস্ট' type='PopularPosts' version='2'>
          <b:includable id='main'><h2><data:title/></h2><div class='widget-content'><b:include name='posts'/></div></b:includable>
        </b:widget>
        <b:widget id='Label1' locked='false' title='ক্যাটাগরি' type='Label' version='2'>
          <b:includable id='main'><h2><data:title/></h2><div class='widget-content'><b:include name='content'/></div></b:includable>
        </b:widget>
      </b:section>
    </aside>

    <!-- MAIN CONTENT -->
    <main class='main-column'>
      <!-- FEATURED ZONE -->
      <b:section class='featured-section' id='featured' maxwidgets='2' showaddelement='yes'>
        <b:widget id='FeaturedPost1' locked='false' title='প্রধান সংবাদ' type='FeaturedPost' version='2'>
          <b:includable id='main'>
            <h2 class='section-title'><data:title/></h2>
            <b:include name='content'/>
          </b:includable>
        </b:widget>
      </b:section>

      <div class='main-inner'>
        <b:section class='main' id='main' showaddelement='no'>
          <b:widget id='Blog1' locked='true' title='পোস্ট সমূহ' type='Blog' version='2'>
            <b:includable id='main'>
              <b:loop values='data:posts' var='post'>
                <article class='post'>
                  <b:if cond='data:post.featuredImage'>
                    <a expr:href='data:post.url'><img expr:src='data:post.featuredImage' expr:alt='data:post.title'/></a>
                  </b:if>
                  <b:if cond='data:post.title'>
                    <h2 class='post-title'><a expr:href='data:post.url'><data:post.title/></a></h2>
                  </b:if>
                  <div class='post-header-line-1'>
                    <span>📅 <data:post.timestamp/></span>
                    <b:if cond='data:post.author'><span>✍️ <data:post.author/></span></b:if>
                    <b:if cond='data:post.labels'><span>🏷️ <b:loop values='data:post.labels' var='label'><a expr:href='data:label.url'><data:label.name/></a><b:if cond='data:label.isLast != &quot;true&quot;'>, </b:if></b:loop></span></b:if>
                  </div>
                  <div class='post-body'><data:post.body/></div>
                  <b:if cond='data:post.hasJumpLink'>
                    <div class='jump-link'>
                      <a expr:href='data:post.url + &quot;#more&quot;'>আরও পড়ুন →</a>
                    </div>
                  </b:if>
                </article>
              </b:loop>
              <div class='blog-pager'>
                <b:if cond='data:newerPageUrl'><a expr:href='data:newerPageUrl'>← নতুন পোস্ট</a></b:if>
                <b:if cond='data:olderPageUrl'><a expr:href='data:olderPageUrl'>পুরাতন পোস্ট →</a></b:if>
              </div>
            </b:includable>
          </b:widget>
        </b:section>
      </div>
    </main>

    <!-- RIGHT SIDEBAR -->
    <aside class='sidebar-wrapper right-sidebar'>
      <b:section class='sidebar' id='right-sidebar' preferred='yes' showaddelement='yes'>
        <b:widget id='Profile1' locked='false' title='লেখক পরিচিতি' type='Profile' version='2'>
          <b:includable id='main'><h2><data:title/></h2><div class='widget-content'><b:include name='profile'/></div></b:includable>
        </b:widget>
        <b:widget id='Image1' locked='false' title='বিজ্ঞাপন' type='Image' version='2'>
          <b:includable id='main'><h2><data:title/></h2><div class='widget-content'><b:include name='content'/></div></b:includable>
        </b:widget>
        <b:widget id='BlogArchive1' locked='false' title='আর্কাইভ' type='BlogArchive' version='2'>
          <b:includable id='main'><h2><data:title/></h2><div class='widget-content'><b:include name='flat'/></div></b:includable>
        </b:widget>
        <b:widget id='HTML1' locked='false' title='বাণী চিরন্তনী' type='HTML' version='2'>
          <b:includable id='main'><h2><data:title/></h2><div class='widget-content'><data:content/></div></b:includable>
        </b:widget>
      </b:section>
    </aside>

  </div>
</div>

<!-- FOOTER -->
<footer class='site-footer'>
  <div class='outer-wrapper'>
    <div class='footer-grid'>
      <b:section class='footer-cols' id='footer-cols' maxwidgets='4' showaddelement='yes'>
        <b:widget id='LinkList2' locked='false' title='দরকারি লিংক' type='LinkList' version='2'>
          <b:includable id='main'><h2><data:title/></h2><div class='widget-content'><b:include name='content'/></div></b:includable>
        </b:widget>
        <b:widget id='Label2' locked='false' title='বিভাগ' type='Label' version='2'>
          <b:includable id='main'><h2><data:title/></h2><div class='widget-content'><b:include name='content'/></div></b:includable>
        </b:widget>
        <b:widget id='HTML2' locked='false' title='যোগাযোগ' type='HTML' version='2'>
          <b:includable id='main'><h2><data:title/></h2><div class='widget-content'><data:content/></div></b:includable>
        </b:widget>
      </b:section>
    </div>
    <div class='footer-bottom'>
      <b:section class='footer-bottom-section' id='footer-bottom' maxwidgets='1' showaddelement='no'>
        <b:widget id='Attribution1' locked='true' title='' type='Attribution' version='2'>
          <b:includable id='main'>© <data:blog.title/> · ${new Date().getFullYear()} · Powered by <a href='https://ahaiweb.lovable.app'>AHAiWEB</a></b:includable>
        </b:widget>
      </b:section>
    </div>
  </div>
</footer>

</body>
</html>`;
}

// Generates Blogger-compatible Atom XML for posts import
export function generateBloggerAtomExport(posts: Array<{
  id: string; title: string; content: string | null; excerpt: string | null;
  published_at: string | null; created_at: string; slug: string; featured_image: string | null;
}>, siteTitle: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const now = new Date().toISOString();
  const entries = posts.map((p) => {
    const date = p.published_at || p.created_at;
    const body = p.content || p.excerpt || "";
    const imageTag = p.featured_image ? `<img src="${esc(p.featured_image)}"/>` : "";
    return `<entry>
  <id>tag:blogger.com,1999:blog.post-${p.id}</id>
  <published>${date}</published>
  <updated>${date}</updated>
  <category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/blogger/2008/kind#post"/>
  <title type="text">${esc(p.title)}</title>
  <content type="html">${esc(imageTag + body)}</content>
  <author><name>AHAiWEB</name></author>
</entry>`;
  }).join("\n");

  return `<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005">
  <id>tag:blogger.com,1999:blog-ahaiweb-export</id>
  <updated>${now}</updated>
  <title type="text">${esc(siteTitle)}</title>
  <generator version="1.0" uri="https://ahaiweb.lovable.app">AHAiWEB Exporter</generator>
${entries}
</feed>`;
}

export function downloadFile(filename: string, content: string, mime = "application/xml") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

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
<link href='https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&amp;family=Playfair+Display:wght@600;700;900&amp;display=swap' rel='stylesheet'/>
<b:skin><![CDATA[
/*!
Theme Name: ${title}
Description: ${description}
Author: AHAiWEB
*/
/* Variables */
:root{
  --primary:${primary};
  --bg:${bg};
  --fg:#0f172a;
  --muted:#64748b;
  --border:#e2e8f0;
  --card:#ffffff;
}
*{box-sizing:border-box}
body{margin:0;font-family:${fBody};background:var(--bg);color:var(--fg);line-height:1.7}
h1,h2,h3,h4{font-family:${fHead};margin:0 0 .5em;line-height:1.25}
a{color:var(--primary);text-decoration:none}
a:hover{text-decoration:underline}
img{max-width:100%;height:auto}

.outer-wrapper{max-width:1240px;margin:0 auto;padding:0 16px}
.header{background:var(--card);border-bottom:1px solid var(--border);padding:14px 0;position:sticky;top:0;z-index:50}
.header h1.title{font-size:1.6rem;color:var(--primary)}
.header h1.title a{color:inherit}
.header .description{color:var(--muted);font-size:.9rem}

/* 3-column grid */
.main-wrapper{display:grid;grid-template-columns:240px 1fr 280px;gap:24px;margin:24px 0}
@media (max-width: 1024px){.main-wrapper{grid-template-columns:1fr 280px}}
@media (max-width: 768px){.main-wrapper{grid-template-columns:1fr}}

.sidebar-wrapper{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px}
.main-inner{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px}

/* Post */
.post{padding-bottom:24px;margin-bottom:24px;border-bottom:1px solid var(--border)}
.post:last-child{border-bottom:0}
.post h2.post-title,.post h3.post-title{font-size:1.5rem}
.post h2.post-title a,.post h3.post-title a{color:var(--fg)}
.post-header-line-1{color:var(--muted);font-size:.85rem;margin:.25rem 0 .75rem}
.post-body{font-size:1rem}
.post-body img{border-radius:8px;margin:12px 0}
.jump-link a{display:inline-block;margin-top:10px;background:var(--primary);color:#fff;padding:8px 14px;border-radius:8px}

/* Widgets */
.widget{margin-bottom:18px}
.widget .widget-content{font-size:.92rem}
.widget h2{font-size:1rem;color:var(--primary);border-bottom:2px solid var(--primary);padding-bottom:6px;margin-bottom:10px}
.widget ul{list-style:none;padding:0;margin:0}
.widget ul li{padding:6px 0;border-bottom:1px dashed var(--border)}

/* Footer */
.footer{margin-top:32px;padding:18px 0;text-align:center;color:var(--muted);font-size:.85rem;border-top:1px solid var(--border)}

/* Pagination */
.blog-pager{text-align:center;padding:16px 0}
.blog-pager a{background:var(--primary);color:#fff;padding:8px 16px;border-radius:8px;display:inline-block;margin:0 4px}
]]></b:skin>
<b:defaultmarkups>
<b:defaultmarkup type='Common'>
<b:includable id='main'><b:include name='widget'/></b:includable>
</b:defaultmarkup>
</b:defaultmarkups>
</head>
<body>
<div class='outer-wrapper'>
  <header class='header'>
    <b:section class='header-section' id='header' maxwidgets='2' showaddelement='yes'>
      <b:widget id='Header1' locked='false' title='${title}' type='Header' version='2'>
        <b:includable id='main'>
          <h1 class='title'><a expr:href='data:blog.homepageUrl'><data:title/></a></h1>
          <p class='description'><data:description/></p>
        </b:includable>
      </b:widget>
    </b:section>
  </header>

  <div class='main-wrapper'>
    <aside class='sidebar-wrapper left-sidebar'>
      <b:section class='sidebar' id='left-sidebar' preferred='yes' showaddelement='yes'>
        <b:widget id='PopularPosts1' locked='false' title='জনপ্রিয় পোস্ট' type='PopularPosts' version='2'>
          <b:includable id='main'><h2><data:title/></h2><div class='widget-content'><b:include name='posts'/></div></b:includable>
        </b:widget>
      </b:section>
    </aside>

    <main class='main-wrapper-inner'>
      <div class='main-inner'>
        <b:section class='main' id='main' showaddelement='no'>
          <b:widget id='Blog1' locked='true' title='Blog Posts' type='Blog' version='2'>
            <b:includable id='main'>
              <b:loop values='data:posts' var='post'>
                <article class='post'>
                  <b:if cond='data:post.title'>
                    <h2 class='post-title'><a expr:href='data:post.url'><data:post.title/></a></h2>
                  </b:if>
                  <div class='post-header-line-1'>
                    <span><data:post.timestamp/></span>
                    <b:if cond='data:post.author'> · <data:post.author/></b:if>
                  </div>
                  <div class='post-body'><data:post.body/></div>
                  <b:if cond='data:post.hasJumpLink'>
                    <div class='jump-link'>
                      <a expr:href='data:post.url + &quot;#more&quot;'>আরও পড়ুন</a>
                    </div>
                  </b:if>
                </article>
              </b:loop>
              <div class='blog-pager'>
                <b:if cond='data:newerPageUrl'><a expr:href='data:newerPageUrl'>← নতুন</a></b:if>
                <b:if cond='data:olderPageUrl'><a expr:href='data:olderPageUrl'>পুরাতন →</a></b:if>
              </div>
            </b:includable>
          </b:widget>
        </b:section>
      </div>
    </main>

    <aside class='sidebar-wrapper right-sidebar'>
      <b:section class='sidebar' id='right-sidebar' preferred='yes' showaddelement='yes'>
        <b:widget id='Profile1' locked='false' title='লেখক' type='Profile' version='2'>
          <b:includable id='main'><h2><data:title/></h2><div class='widget-content'><b:include name='profile'/></div></b:includable>
        </b:widget>
        <b:widget id='Label1' locked='false' title='ক্যাটাগরি' type='Label' version='2'>
          <b:includable id='main'><h2><data:title/></h2><div class='widget-content'><b:include name='content'/></div></b:includable>
        </b:widget>
        <b:widget id='BlogArchive1' locked='false' title='আর্কাইভ' type='BlogArchive' version='2'>
          <b:includable id='main'><h2><data:title/></h2><div class='widget-content'><b:include name='flat'/></div></b:includable>
        </b:widget>
      </b:section>
    </aside>
  </div>

  <footer class='footer'>
    <b:section class='footer-section' id='footer' showaddelement='yes'>
      <b:widget id='Attribution1' locked='true' title='' type='Attribution' version='2'>
        <b:includable id='main'>© <data:blog.title/> · Powered by AHAiWEB</b:includable>
      </b:widget>
    </b:section>
  </footer>
</div>
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

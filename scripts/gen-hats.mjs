// Generate BRIM hat inventory images via Vercel AI Gateway (Google "Nano Banana Pro").
// Usage: node scripts/gen-hats.mjs [collection] [limit]
//   collection = mens | womens | kids | all   (default all)
//   limit      = max hats from that collection  (default all)
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { generateText, gateway } from 'ai';

// --- load .env.local (no dotenv dependency) ---
const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const line of envText.split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
if (!process.env.AI_GATEWAY_API_KEY) throw new Error('AI_GATEWAY_API_KEY missing from .env.local');

const MODEL = process.env.HAT_MODEL || 'google/gemini-3-pro-image'; // "Nano Banana Pro"
const OUT = new URL('../public/inventory/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const STYLE_PRODUCT =
  'E-commerce studio product photograph, centered and floating slightly above a subtle soft contact shadow, on a seamless warm off-white (#FAF9F7) background, soft even diffused studio lighting, no people, no hands, photorealistic, ultra-detailed texture, premium catalog style, square 1:1 framing.';
const STYLE_SCENE =
  'Editorial lifestyle photograph, the hat as the hero object resting in a real environment, soft natural directional light, shallow depth of field, warm and aspirational mood, no people, no hands, photorealistic, square framing.';
const SCENE_COLLECTIONS = new Set(['heroes']);

const COLLECTIONS = {
  mens: [
    ['carter-fedora', 'a wide-brim rabbit-felt fedora in walnut brown with a black grosgrain ribbon band'],
    ['lido-panama', 'a Panama hat woven from natural toquilla straw with a slim black band'],
    ['brooklyn-cap', 'a classic six-panel baseball cap in deep navy with a curved brim'],
    ['dock-beanie', 'a cuffed ribbed merino-wool beanie in forest green'],
    ['harbor-bucket', 'a waxed-cotton bucket hat in olive green'],
    ['mesa-widebrim', 'a wide-brim wool-felt hat in camel tan with a slim leather band'],
    ['depot-trucker', 'a two-tone trucker cap with a cream foam front panel and brown mesh back'],
    ['carrick-flatcap', 'a wool flat cap (newsboy) in grey herringbone'],
  ],
  womens: [
    ['riviera-sun', "a women's wide-brim floppy sun hat woven from natural straw with an ivory ribbon band"],
    ['margaux-cloche', "a women's 1920s wool-felt cloche hat in dusty rose with a tonal bow"],
    ['left-bank-beret', "a women's soft wool beret in camel"],
    ['adler-floppy', "a women's dramatic wide-brim wool-felt floppy hat in charcoal grey"],
    ['colette-fedora', "a women's slim-brim felt fedora in blush mauve with a tonal band"],
    ['aspen-bobble', "a women's chunky cable-knit bobble beanie in cream with a fluffy pom-pom"],
    ['marlowe-bucket', "a women's quilted bucket hat in soft sage green"],
    ['provence-boater', "a women's flat-top straw boater hat with a navy ribbon band"],
  ],
  kids: [
    ['cub-beanie', "a small toddler's knit beanie in mustard yellow with little rounded bear ears"],
    ['rex-bucket', "a small boy's bucket hat in grass green with a playful all-over cartoon dinosaur print"],
    ['daisy-sun', "a small girl's ruffled cotton sun hat in soft pink with a chin tie and an embroidered daisy"],
    ['rookie-cap', "a small child's baseball cap in bright cherry red with a curved brim"],
    ['sprout-pom', "a small child's knit beanie in cheerful rainbow stripes with a fluffy pom-pom"],
    ['pebble-sun', "a small girl's floppy straw sun hat with a blue gingham bow"],
    ['scout-trapper', "a small boy's trapper hat in tan with cozy faux-fur lining and ear flaps"],
    ['tadpole-bucket', "a small child's reversible bucket hat in pastel sky blue with a white cloud print"],
  ],
  capsule: [
    ['shearling-trapper', 'a luxe shearling trapper hat in tan with cream fur-lined ear flaps'],
    ['cashmere-beanie', 'a fine-ribbed cashmere beanie in oatmeal'],
    ['fairisle-beanie', 'a Nordic fair-isle knit beanie patterned in cream, navy and red'],
    ['cossack-hat', 'a black faux-fur Cossack (papakha) winter hat'],
    ['tweed-flatcap-winter', 'a brown Donegal tweed flat cap in heavy winter weight'],
    ['teddy-bucket', 'a teddy faux-shearling bucket hat in caramel'],
    ['felt-cloche-winter', 'a deep plum wool-felt winter cloche hat'],
    ['earflap-quilted', 'a quilted aviator hat with ear flaps in olive green'],
  ],
  colorways: [
    ['carter-heritage', 'a wide-brim rabbit-felt fedora in deep oxblood burgundy with a tonal grosgrain band'],
    ['carter-coastal', 'a wide-brim rabbit-felt fedora in deep marine navy with a tonal grosgrain band'],
    ['carter-field', 'a wide-brim rabbit-felt fedora in loden forest green with a tonal grosgrain band'],
    ['carter-mono', 'a wide-brim rabbit-felt fedora in black with a black grosgrain band'],
    ['carter-sun', 'a wide-brim rabbit-felt fedora in warm camel tan with a tonal grosgrain band'],
  ],
  custom: [
    ['custom-aubergine-fedora', 'a bespoke hand-blocked wide-brim fedora in deep aubergine fur-felt, with a hand-stitched dark leather band and a single tonal feather, luxury made-to-order millinery'],
    ['custom-charcoal-trilby', 'a bespoke charcoal fur-felt trilby with a slim black grosgrain band and a mother-of-pearl hat pin, luxury made-to-order millinery'],
    ['custom-camel-widebrim', 'a bespoke camel rabbit-felt wide-brim hat with a braided leather band and a small brass pin, luxury made-to-order millinery'],
  ],
  heroes: [
    ['hero-coastal', 'a deep navy Panama straw hat resting on sun-bleached weathered teak boards beside a calm sunlit sea, airy coastal resort mood'],
    ['hero-mono', 'a black wide-brim fur-felt fedora on a polished dark stone ledge in a minimalist concrete space, dramatic moody side light'],
    ['hero-sun', 'a natural straw wide-brim sun hat on warm terracotta tiles dappled with golden afternoon sunlight and soft olive-leaf shadows'],
  ],
  gifting: [
    ['gift-box', 'a premium hat gift box in deep oxblood with a hand-tied grosgrain ribbon and a small kraft gift tag, lid slightly ajar revealing cream tissue paper'],
    ['gift-wrapped-hat', 'a felt fedora nestled in an open premium gift box with cream tissue paper and a ribbon, ready to be gifted'],
    ['gift-card', 'an elegant matte charcoal gift card with a small embossed hat emblem, resting beside a thin oxblood ribbon'],
  ],
  accessories: [
    ['hat-brush', 'a premium horsehair hat brush with a smooth walnut wooden handle'],
    ['travel-case', 'a structured round leather hat travel case in tan with a brass clasp and a carry handle'],
    ['care-kit', 'a hat care kit neatly arranged: a small tin of felt conditioner, a lint brush, and a cedar block'],
    ['rain-cover', 'a clear folded waterproof rain cover for a wide-brim hat'],
  ],
  occasion: [
    ['top-hat', 'a formal black silk top hat'],
    ['derby-bowler', 'a classic charcoal wool-felt bowler derby hat'],
    ['fascinator', 'an elegant occasion fascinator in burgundy with feathers and fine netting'],
    ['satin-turban', 'a draped satin evening turban in deep emerald green'],
  ],
  active: [
    ['runner-cap', 'a lightweight performance running cap in reflective heather grey with a perforated mesh panel'],
    ['sun-bucket', 'a packable technical nylon sun bucket hat in sand with a chin cord'],
    ['sport-visor', 'a sporty sun visor in white with a navy terry sweatband'],
    ['ski-beanie', 'a technical ski beanie in black with an electric-blue stripe and a small pom'],
  ],
};

const which = (process.argv[2] || 'all').toLowerCase();
const limit = Number(process.argv[3] || Infinity);
const sets = which === 'all' ? Object.keys(COLLECTIONS) : [which];

for (const set of sets) {
  const hats = COLLECTIONS[set];
  if (!hats) { console.log(`unknown collection "${set}" (use mens|womens|kids|all)`); continue; }
  console.log(`\n[${set}] model ${MODEL} · ${Math.min(limit, hats.length)} hat(s)`);
  for (const [slug, desc] of hats.slice(0, limit)) {
    process.stdout.write(`• ${slug.padEnd(16)} `);
    const t = Date.now();
    try {
      const { files, text, warnings } = await generateText({
        model: gateway(MODEL),
        prompt: `${desc}. ${SCENE_COLLECTIONS.has(set) ? STYLE_SCENE : STYLE_PRODUCT}`,
      });
      const img = files.find((f) => f.mediaType?.startsWith('image/'));
      if (!img) {
        console.log(`no image (text: ${JSON.stringify(text?.slice(0, 60))} · warnings: ${JSON.stringify(warnings)})`);
        continue;
      }
      const ext = img.mediaType === 'image/jpeg' ? 'jpg' : 'png';
      const buf = Buffer.from(img.base64, 'base64');
      writeFileSync(new URL(`${slug}.${ext}`, OUT), buf);
      console.log(`ok  ${img.mediaType}  ${(buf.length / 1024).toFixed(0)}KB  ${((Date.now() - t) / 1000).toFixed(1)}s`);
    } catch (e) {
      console.log(`FAILED: ${e?.message || e}`);
    }
  }
}
console.log('\nsaved to public/inventory/');

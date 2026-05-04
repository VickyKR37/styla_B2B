
// src/data/styleReports.ts

export const bodyShapeKeyMap = {
  "Inverted Triangle": "invertedTriangle",
  "Pear Shape": "pear", // Adjusted to match QuestionnaireForm
  "Straight": "rectangle", // Adjusted to match QuestionnaireForm ("Straight/Rectangle" -> "Straight")
  "Round/Apple": "apple",
  "Hourglass": "hourglass",
};

export const dominantScaleKeyMap = {
  Large: "large",
  Medium: "medium",
  Small: "small",
};

export const dominantLineKeyMap = {
  Combination: "combination",
  Straight: "straight",
  Curved: "curved",
};

export const bodyShapeAdvice: Record<string, any> = { // Added type for better safety, though 'any' for flexibility
  pear: {
    title: "Pear Body Shape",
    description:
      "Small on top with narrow shoulders and/or small bust, narrow waist, and broader hips. Often has full thighs and a heavier bottom, with an all-over curvy bodyline.",
    examples: "J-Lo",
    styling: {
      balanceStrategy:
        "Make shoulders and top half appear wider while emphasizing the waist to create proportion balance.",
      fabrics: {
        recommended:
          "Use fabrics with more bulk on top and softer, looser woven fabrics on bottom. Add texture and layers on top with darker, less bulky fabrics below.",
        patterns:
          "Bold patterns restricted to top half, with subtle patterns and darker/monochromatic colours on bottom. Try horizontal stripes on top but avoid them on bottom.",
        colours:
          "Lighter colours for tops with darker colours for bottoms to create visual balance.",
      },
      clothing: {
        tops: "Use shoulder pads, puff sleeves, bolero jackets, scarves, and jewellery around neckline. Choose wide lapels, high-necked tops (crew, polo, slash), and semi-fitted styles that end at the right length.",
        bottoms:
          "Opt for slightly dropped waist or low-rise trousers, wider-legged styles falling straight from hip, A-line skirts, and side-zipped flat-front trousers without pleats or side pockets.",
        dresses:
          "1950s style dresses work best - fitted top, defined waist with a full skirt.",
        styling:
          "Consider belts to accentuate waist, look for darting and shaping. Tops and jackets should finish around hip bone.",
      },
      avoid: [
        "Raglan sleeves, revealing necklines, and tight tops that emphasize narrow shoulders",
        "Low-slung belts that draw attention to wide hips",
        "Pockets on bottom half and stiff waistbands",
        "Tapered trousers and cropped styles",
        "Drawstring or elasticated waist trousers that add bulk",
        "Shorts that cut across the widest part of thighs",
        "Straight-cut jeans with stiff fabric (look for stretch blends)",
        "Bias cut skirts",
        "Tight boot cut trousers that cling to thighs",
      ],
    },
  },
  hourglass: {
    title: "Hourglass Body Shape",
    description:
      'Balanced hips and shoulders with a definite waist (could be 8-10" less than hips). Generally curvy all over or with straight shoulders and curvy bottom.',
    examples: "Catherine Zeta-Jones, Beyoncé",
    styling: {
      balanceStrategy:
        "Maintain basic silhouette to avoid looking bigger. Show off curves while emphasizing the waist, not hiding it.",
      fabrics: {
        recommended:
          "Soft and drapey fabrics around curvy parts, with tighter woven/stiffer materials on straighter areas or to provide structure around the middle.",
        patterns:
          "Contoured patterns that relate to scale. Avoid big geometric patterns.",
        colours:
          "Interesting colours on top with darker/monochromatic colours on bottom half.",
      },
      clothing: {
        tops: "Clothing with shape that emphasizes the waist. Try shaped single-breasted jackets with 2-3 buttons (be careful with single buttons as they can gape at chest). Jackets with no lapels or narrow ones. Can tuck in tops or use tops that end around the hip bone, fitted or semi-fitted.",
        necklines:
          "Show some skin - V, square, scoop, wrap, sweetheart, soft/crinkle shirts. Use pendant necklaces or long scarves to break up the top half.",
        bottoms:
          "A-line or panelled skirts. Trousers with no waistband are good, or try slightly dropped waist. Side-zipped or flat-front trousers without pleats.",
        dresses:
          "Need shaping and/or waist detail, preferably with a lower neckline and fuller skirt.",
        styling:
          "Skirts and trousers should be flat as possible over tummy and hips.",
      },
      avoid: [
        "Baggy items that hide the waist like smocks and kaftans",
        "Pockets on the bottom half and stiff fitted waistbands",
        "Tapered or 'skinny' trousers/jeans and shorts",
        "Narrow pinstripe trousers or sharp crease down the front",
        "Sharp lines and sharp lapels on tops",
        "Low slung belts across the hips",
        "Bias cut skirts and elasticated or drawstring waists",
        "Tight boot cut trousers and polo neck jumpers",
      ],
    },
  },
  invertedTriangle: {
    title: "Inverted Triangle/Goblet Shape",
    description:
      "Wider shoulder than hip line. Usually have a large bust. Often have a short waist – generally a straight bodyline.",
    examples: "Dolly Parton",
    notes:
      "Can be athletic figures with broad shoulders or top-heavy 'busty' women. Tend to be slim and straight over bottom and thighs without much of a waist. Often have big upper arms and complain about 'back fat'.",
    styling: {
      balanceStrategy:
        "Minimize emphasis on waist while showing off bust and/or hips and legs. Weight gain tends to accumulate in the middle, creating a goblet shape.",
      fabrics: {
        recommended:
          "Simple colours, straight lines, structure without too much pattern. Fabrics should generally have structure and be stiffer/tightly woven, with potentially softer material over a full bust.",
        patterns:
          "Vertical patterns on top half (or avoid patterns altogether). Can use horizontal patterns or checks on bottom.",
        colours:
          "Darker and monochromatic on top to break up shoulder width and bust. Lighter colours on bottom half.",
      },
      clothing: {
        tops: "Simple lines, sharp, structured, crisp styles - avoid fussy details that make you look heavy. Tailoring is good. Lower necklines to reduce the heavy effect of solid colour blocks. V, square, wrap, and sweetheart necklines work well. Wide straps on vest tops and 3/4 length or interesting cuff details.",
        bottoms:
          "Narrow/straight/boot cut trousers are good, as are jeans. Try straight, short skirts with interesting hems (flippy, tulip, fishtail).",
        dresses:
          "Can be difficult, but bias cut styles work well. Try dresses with deep halter necks, empire lines, or wrap styles.",
        bras: "A good fitting bra is essential.",
        styling:
          "Use pendant necklaces or scarves to break up the top half. For tops with gathers around tummy, use skimming material that doesn't cling.",
      },
      gobletSpecific:
        "If a goblet shape, drawstring trousers can work with longer straight-cut tops that cover the middle area.",
      avoid: [
        "A-line skirts or wide trousers that will swamp slim hips",
        "Sleeves that make arms or bust look heavier - ensure good fit across upper arm",
        "Emphasizing the waist with belts",
        "Double-breasted jackets, full/puff sleeves, and wide collars",
      ],
    },
  },
  rectangle: { // "Straight" from QuestionnaireForm maps to "rectangle" here
    title: "Straight Body Shape",
    description:
      "Hips and shoulders roughly in line, no definite waist – generally straight bodyline. Often a boxy, column-like outline.",
    examples: "Princess Diana, Keira Knightly",
    styling: {
      balanceStrategy:
        "Keep silhouette tall and lean, let clothes fall in a straight line from shoulders or create shape with draping or structured details.",
      fabrics: {
        recommended: "Structured, stiff and/or tightly woven fabrics.",
        patterns:
          "Angular patterns - stripes, zig zags, geometric shapes. Size depends on scale (avoid narrow pin-stripe suits if very tall/thin).",
        colours:
          "Can mix colours except in problem areas (e.g., avoid contrasting colours on stomach).",
      },
      clothing: {
        tops: "Skimming dresses, smock tops, empire line styles, unstructured/one-button jackets with angular lapels. High necked tops (polos, slash, shirts, crew) work well.",
        bottoms:
          "Most trouser styles suit this shape, especially 'mannish', boot cut and straight-cut. Try most skirt styles including bias cut to add illusion of curves.",
        dresses:
          "Shift dresses or shirtwaists work well with stiff/structured fabric.",
        styling:
          "Emphasize and define shoulders. Can add curves with careful fabric choice and gathers. Top length depends on client but generally not too short. Experiment with necklace and scarf lengths.",
      },
      weightGain: {
        softened:
          "Can become a 'Softened Straight' - follow same advice but use softer fabrics.",
        barrel:
          "With significant weight gain, can become a 'Barrel' or 'Rectangle' shape - when bust, waist and hips have little distinction but straight shoulders and good legs remain.",
      },
      barrelSpecific: [
        "Use the 'column of colour' technique",
        "Contain top half in tops/jackets reaching crotch level",
        "Try straight cut trousers/skirts and drawstring trousers",
      ],
      avoid: [
        "Details drawing attention to the waist",
        "Clothes stopping at waist level (jumpers, tops, jackets)",
        "Frills, flounces, and clingy materials",
      ],
    },
  },
  apple: {
    title: "Round/Apple Body Shape",
    description: "Rounded all over, plump, no definite waist – curvy.",
    examples: "Kathy Bates",
    notes:
      "Many clients think they are round just because they have a tummy. True apple shapes are very curvy all over with sloping shoulders, soft stomach and wide bottom.",
    styling: {
      balanceStrategy:
        "Move attention away from middle towards face and shoulders. Use properly scaled accessories and ensure impeccable grooming.",
      fabrics: {
        recommended:
          "Tightly woven fabrics that hold shape without being stiff. Fabrics should drape but not cling.",
        avoidIfLarger:
          "Shiny fabrics, flimsy/floaty materials, and bulky textures.",
        patterns:
          "Pattern size should relate to body scale (not too tiny). Vertical or asymmetric patterns work well.",
        colours:
          "Avoid contrasting colours in middle area. Use monochromatic looks, darker tone-on-tone, or 'column of colour'. Dark colours are generally slimming - use colour around face or in accessories.",
      },
      clothing: {
        general:
          "Keep styles simple to draw attention away from middle. Clothes should be loose and unstructured but right-sized - 'skim not cling'.",
        tops: "Emphasize shoulder-line with shoulder pads if shoulders slope. Tops, dresses and jackets should drop in straight line from shoulder. Empire lines accentuate the narrowest part of torso.",
        bottoms:
          "Flat-front trousers falling straight from thighs. Skirts should be slightly A-line or panelled.",
        dresses:
          "Shift dresses or straight dresses work well. Try shapewear underneath for smoother lines.",
        details:
          "Show some skin/cleavage with soft shirt styles or scoop, sweetheart and wrap necklines. Drawstring or slight elastication at waist can work. Use open shirts as soft 'jackets'.",
      },
      avoid: [
        "Belts and tucking in tops that visually cut the body in two",
        "Tops that are too long on petite figures",
        "Horizontal stripes",
      ],
    },
  },
};

export const dominantScaleAdvice: Record<string, any> = { // Added type for better safety
  small: {
    title: "Small Scale",
    description:
      "Your scale refers to your physical dimensions and proportions. Recognizing your scale is essential for selecting clothing and accessories that flatter your figure. These recommendations serve as guidelines to help you choose details, fabrics, colours, and accessories that complement your natural scale. Remember, these are guidelines—not strict rules. Your personal style and bodyline should also be considered. If you're a small scale client (typically under 5'3\" or 1.6m tall, not overweight, with a small shoe size and slender wrists), you'll want to avoid details, patterns, accessories or textures that could overwhelm your frame.",
    elements: {
      clothingDetails: [
        "Choose smaller/finer details such as delicate buttons, subtle lapels, small buckles and bows, refined pocket flaps, and slim zips.",
        "Avoid contrasting details that dominate your garments such as bold coloured stitching or large blocks of colour or pattern.",
      ],
      fabric: [
        "Select lightweight, fine, sheer fabrics like merino wool, cotton, and chiffon.",
        "Stay away from heavily textured or bulky materials - instead try narrow cord, fine tweed, or fine angora.",
        "Look for sheer, tighter weaves like fine knits and fine silks.",
        "Choose patterns that are small and relate to your bodyline, such as fine pinstripes and small polka dots.",
      ],
      colour: [
        "Utilise the 'column of colour' technique – dress in one colour or tone from head to toe.",
        "Follow the 25%, 75% rule (75% neutral, probably darker colour and highlight with 25% lighter/brighter colour).",
      ],
      accessories: {
        jewellery:
          "Wear small, delicate pieces. Nothing too big or garish. If you want to wear a statement necklace, pair it with tiny or no earrings. Thin bracelets and watches will complement your frame.",
        glasses: "Choose delicate frames, not too much detail, try rimless.",
        hats: "Opt for small, up-turned brim with minimal, delicate decorations or a fascinator.",
        scarves:
          "Select lightweight silk or polyester with fine knit patterns and small sized patterns.",
        bagsAndBriefcases:
          "Small to medium in size. A big bag will swamp you. Better to carry two smaller bags than one big one.",
        belts:
          "The buckle should be small and simple, and the buckle shape should relate to your bodyline.",
        shoes: "Choose delicate heels, not too much colour or detail.",
      },
      hair: [
        "Simple, neat styles that open up your face.",
        "Nothing too curly or wild.",
      ],
      necklines: [
        "Simple, small collars.",
        "Delicate ties rather than pussy cat bows.",
        "Not too open.",
      ],
    },
  },
  medium: {
    title: "Medium Scale",
    description:
      "Your scale refers to your physical dimensions and proportions. Recognizing your scale is essential for selecting clothing and accessories that flatter your figure. These recommendations serve as guidelines to help you choose details, fabrics, colours, and accessories that complement your natural scale. Remember, these are guidelines—not strict rules. Your personal style and bodyline should also be considered. If you're a medium scale client (typically between 5'3\" and 5'8\" or 1.6-1.72m tall), you may or may not be overweight with an average shoe size and wrist measurement. However, you could also be shorter and overweight or taller and underweight.",
    note: "Remember to consider your bodyline alongside your scale.",
    elements: {
      clothingDetails: [
        "Avoid extremes - look for details that don't dominate or look too small, such as moderately sized buttons, lapels, buckles and bows, pocket flaps, and zips.",
      ],
      fabric: [
        "Choose medium weight, semi-sheer fabrics like cashmere, wool, cotton jersey, wool crepe, linen, denim, and gauze.",
        "Some texture will work well, such as tweed, angora, lambswool, and cable knits.",
        "Avoid extremes with the weaves - try looser knits or something like silk dupion.",
        "Select patterns that are neither too big nor too small and relate to your bodyline, like stripes, swirls, and dots.",
      ],
      colour: ["Depending on your body line, you can experiment with colour."],
      accessories: {
        jewellery:
          "Medium sized pieces work best. Nothing too big or too tiny. If you want to wear a statement necklace, balance with smaller earrings. Bracelets and watches shouldn't be too big or small.",
        glasses:
          "Choose frames that aren't too obvious or heavy. Some detail and/or colour would be good - you could try rimless or 'half and half'.",
        hats: "Not too small - the rim needs to be within the width of your shoulders. You can experiment with some trims and decoration, but nothing too overwhelming.",
        scarves:
          "Medium weight silk or polyester, pashminas, and average sized patterns are ideal.",
        bagsAndBriefcases:
          "Medium to large in size. A massive bag could swamp you.",
        belts:
          "Not too wide or too narrow. Buckle shouldn't overpower your frame.",
        shoes: "Medium heels, with some colour or detail if desired.",
      },
      hair: ["You can experiment - just avoid anything too extreme."],
      necklines: ["Again, nothing too extreme."],
    },
  },
  large: {
    title: "Large Scale",
    description:
      "Your scale refers to your physical dimensions and proportions. Recognizing your scale is essential for selecting clothing and accessories that flatter your figure. These recommendations serve as guidelines to help you choose details, fabrics, colours, and accessories that complement your natural scale. Remember, these are guidelines—not strict rules. Your personal style and bodyline should also be considered. If you're a large scale client (typically 5'8\" or 1.72m tall and over), you may or may not be overweight, with a large shoe size and wrist measurement. However, you could also be shorter and overweight. You'll want to avoid insignificant details, patterns, accessories, or textures, as these can make you look bigger.",
    note: "Remember to consider your bodyline alongside your scale.",
    elements: {
      clothingDetails: [
        "Look for larger/obvious details such as bold buttons, prominent lapels, noticeable buckles and bows, distinctive pocket flaps, and zips.",
        "Contrasting details can work well - different coloured stitching, piping, blocks of colour or pattern will add interest.",
      ],
      fabric: [
        "Choose medium to heavy weight fabrics like knitwear, wool crepe, denim, and heavy weight linen. The fabric needs to have some structure and substance.",
        "Some texture works well, such as medium to heavy weight knits and tweed (not too bulky).",
        "For straight bodylines, tighter weaves work better; for curvier bodylines, looser weaves are more flattering.",
        "Select patterns that are medium to large in size and relate to your bodyline, like wide pinstripes, large dots, and swirls.",
      ],
      colour: [
        "To slim the body, utilise the 'column of colour' – dress in one colour or tone from head to toe, and add a different coloured jacket, jumper, or cardigan.",
        "Avoid contrasting colours across a wide part of the body.",
      ],
      accessories: {
        jewellery:
          "Large, striking pieces work best. Nothing too small or delicate. Wide, chunky bracelets and watches will complement your frame.",
        glasses:
          "Strong, big, obvious or coloured frames with some detail. You could try rimless but look for bigger lenses.",
        hats: "Large, striking hats with some decoration.",
        scarves:
          "Heavyweight silk or polyester, heavy knit wooly scarf, pashmina, and large sized patterns.",
        bagsAndBriefcases:
          "Medium to large in size. A big bag will balance your proportions.",
        belts:
          "If you want to wear a belt, look for wide ones with a large buckle.",
        shoes:
          "Look for chunky heels and shoes with colour or detail. Avoid ankle straps if you have thick ankles (as straps will break up the length of your legs), otherwise they could work well.",
      },
      hair: ["Fuller styles will balance your scale better."],
      necklines: ["Wide, open, large collars and necklines."],
    },
  },
};

export const dominantLineAdvice: Record<string, any> = { // Added type for better safety
  curved: {
    title: "Curved Lines",
    advice:
      "Soft, flowing fabrics and rounded accessories will complement your features. For a body with curved lines, choose gently fitted garments with rounded details, well-defined waists, and softer fabrics that emphasize your natural shape.",
    elements: {
      jacket: [
        "Gently fitted",
        "Well defined waist",
        "Rounded hemline",
        "Curved fastening",
        "Round buttons",
      ],
      collars: ["Round", "Rounded notch", "Rolled", "Cowl"],
      necklines: ["Round", "Draped", "Shawl", "Scoop"],
      sleeves: ["Gathered", "Full and billowy", "Rounded shoulder pads"],
      pocket: ["Flap", "Rounded", "Set in"],
      seams: ["Curved seams", "Fine or no top stitching"],
      darts: ["Soft gathers"],
      hats: ["Sheer softer fabrics", "Curved crown and details"],
    },
  },
  straight: {
    title: "Straight Lines",
    advice:
      "Structured pieces with clean lines will harmonize with your angular features. For a body with straight lines, choose edge-to-edge garments with square details, angular elements, and crisp fabrics that complement your defined silhouette.",
    elements: {
      jacket: [
        "Edge to edge",
        "Square hemline",
        "Asymmetrical fastening",
        "Contrasting button/trim",
        "Zips/angular buttons",
      ],
      collars: ["Pointed", "Straight with stiff fabric", "Square", "Stand-up"],
      necklines: ["Square", "V-neck", "Mandarin", "Boat/slash"],
      sleeves: ["Set in", "Straight shoulder pleats", "Square shoulder pads"],
      pocket: ["Well defined", "Square", "Piped"],
      seams: ["Top stitching", "Piping or trim"],
      darts: ["Sharply defined"],
      hats: ["Stiff fabrics", "Angular crown and details"],
    },
  },
  combination: {
    title: "Combination Lines",
    advice:
      "Balance is key for mixed body types. For a body with both curved and straight elements, choose garments that combine structure with softness to create harmony between different features of your silhouette.",
    elements: {
      jacket: [
        "Self trim",
        "Subtly defined waist",
        "Unconstructed",
        "Drapier fabrics",
        "Round/angular buttons",
      ],
      collars: ["Straight with soft fabric", "Notched", "Rolled", "Cowl"],
      necklines: ["Boat", "Curved", "Turtle", "Rounded"],
      sleeves: ["Set in", "Raglan", "Rounded shoulder pads"],
      pocket: ["Patch (rounded bottom)", "Slash", "Square with soft fabric"],
      seams: ["Unconstructed look", "Self top stitching"],
      darts: ["Straight or pleated"],
      hats: ["Softer fabrics", "Softer crown and details"],
    },
  },
};

// Merging the two objects (no longer needed as we use keys directly based on QuestionnaireForm)
/*
export const mergedBodyShapeData = Object.entries(bodyShapeKeyMap).reduce(
  (acc, [displayName, internalKey]) => {
    if (bodyShapeAdvice[internalKey]) {
      acc[displayName] = {
        key: internalKey,
        ...bodyShapeAdvice[internalKey],
      };
    }
    return acc;
  },
  {}
);

export const mergedDominantLineData = Object.entries(dominantLineKeyMap).reduce(
  (acc, [displayName, internalKey]) => {
    if (dominantLineAdvice[internalKey]) {
      acc[displayName] = {
        key: internalKey,
        ...dominantLineAdvice[internalKey],
      };
    }
    return acc;
  },
  {}
);

export const mergedDominantScaleData = Object.entries(
  dominantScaleKeyMap
).reduce((acc, [displayName, internalKey]) => {
  if (dominantScaleAdvice[internalKey]) {
    acc[displayName] = {
      key: internalKey,
      ...dominantScaleAdvice[internalKey],
    };
  }
  return acc;
}, {});
*/

    
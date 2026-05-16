
/**
formeo - https://formeo.io
Version: 5.1.1
Author: Draggable https://draggable.io
*/

Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esmMin = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp$1(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp$1(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp$1(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp$1(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod)), e$1 = {
	"af-ZA": {
		"af-ZA": "Afrikaans (Suid-Afrika)",
		dir: "ltr",
		"en-US": "Engels",
		"ar-TN": "Arabies (Tunisië)",
		"cs-CZ": "Tsjeggies (Tsjeggië)",
		"de-DE": "Duits (Duitsland)",
		"es-ES": "Spaans (Spanje)",
		"fa-IR": "Persies (Iran)",
		"fi-FI": "Fins (Finland)",
		"fr-FR": "Frans (Frankryk)",
		"he-IL": "Hebreeus (Israel)",
		"hi-IN": "Hindi (Indië)",
		"hu-HU": "Hongaars (Hongarye)",
		"it-IT": "Italiaans (Italië)",
		"ja-JP": "Japannees (Japan)",
		"nb-NO": "Boeknoors (Noorweë)",
		"pl-PL": "Pools (Pole)",
		"pt-BR": "Portugees (Brasilië)",
		"pt-PT": "Portugees (Portugal)",
		"ro-RO": "Roemeens (Roemenië)",
		"ru-RU": "Russies (Rusland)",
		"th-TH": "Thai (Thailand)",
		"tr-TR": "Turks (Turkye)",
		"zh-CN": "Chinees (China)",
		"zh-HK": "Chinees (Hongkong SAS China)",
		"action.add.attrs.attr": "Watter kenmerk wil jy byvoeg?",
		"action.add.attrs.value": "Standaard waarde",
		addOption: "Voeg opsie by",
		allFieldsRemoved: "Alle velde is verwyder.",
		allowSelect: "Laat Kies toe",
		and: "en",
		attribute: "kenmerk",
		attributeNotPermitted: `Attribuut "{attribuut}" is nie toegelaat nie, kies asseblief 'n ander.`,
		attributes: "eienskappe",
		"attrs.class": "klas",
		"attrs.className": "klas",
		"attrs.dir": "rigting",
		"attrs.id": "id",
		"attrs.required": "vereis",
		"attrs.style": "styl",
		"attrs.title": "Titel",
		"attrs.type": "tipe",
		"attrs.value": "waarde",
		autocomplete: "AutoComplete",
		button: "Button",
		cancel: "Kanselleer",
		cannotBeEmpty: "Hierdie veld kan nie leeg wees nie",
		cannotClearFields: "Daar is geen velde om skoon te maak nie",
		checkbox: "boks",
		checkboxes: "blok",
		class: "klas",
		clear: "duidelik",
		clearAllMessage: "Is jy seker jy wil alle velde skoonmaak?",
		close: "Naby",
		column: "kolom",
		"condition.target.placeholder": "teiken",
		"condition.type.and": "En",
		"condition.type.if": "As",
		"condition.type.or": "Of",
		"condition.type.then": "Toe",
		"condition.value.placeholder": "waarde",
		confirmClearAll: "Is jy seker jy wil alle velde verwyder?",
		content: "inhoud",
		control: "beheer",
		"controlGroups.nextGroup": "Volgende Groep",
		"controlGroups.prevGroup": "Vorige groep",
		"controls.filteringTerm": "Filtering \"{term}\"",
		"controls.form.button": "Button",
		"controls.form.checkbox-group": "Boks groep",
		"controls.form.input.date": "datum",
		"controls.form.input.email": "e-pos",
		"controls.form.input.file": "Lêeroplaai",
		"controls.form.input.hidden": "Versteek Input",
		"controls.form.input.number": "aantal",
		"controls.form.input.text": "Teksinvoer",
		"controls.form.radio-group": "Radio Group",
		"controls.form.select": "Kies",
		"controls.form.textarea": "textarea",
		"controls.groups.form": "Vorm velde",
		"controls.groups.html": "HTML-elemente",
		"controls.groups.layout": "uitleg",
		"controls.html.divider": "deler",
		"controls.html.header": "kop",
		"controls.html.paragraph": "paragraaf",
		"controls.layout.column": "kolom",
		"controls.layout.row": "ry",
		copy: "Kopieer na Klembord",
		danger: "gevaar",
		defineColumnLayout: "Definieer 'n kolom uitleg",
		defineColumnWidths: "Definieer kolom breedtes",
		description: "Hulp teks",
		descriptionField: "beskrywing",
		"editing.row": "Redigeer tans",
		editorTitle: "Vorm Elemente",
		field: "veld",
		"field.property.invalid": "nie geldig",
		"field.property.isChecked": "gekontroleer word",
		"field.property.isNotVisible": "is nie sigbaar nie",
		"field.property.isVisible": "is sigbaar",
		"field.property.label": "etiket",
		"field.property.valid": "geldig",
		"field.property.value": "waarde",
		fieldNonEditable: "Hierdie veld kan nie geredigeer word nie.",
		fieldRemoveWarning: "Is jy seker jy wil hierdie veld verwyder?",
		fileUpload: "Lêeroplaai",
		formUpdated: "Vorm Opdateer",
		getStarted: "Sleep 'n veld van regs om te begin.",
		group: "groep",
		grouped: "gegroepeer",
		hidden: "Versteek Input",
		hide: "wysig",
		htmlElements: "HTML-elemente",
		if: "As",
		"if.condition.source.placeholder": "bron",
		"if.condition.target.placeholder": "teiken / waarde",
		info: "info",
		"input.date": "datum",
		"input.text": "teks",
		label: "Etiket",
		labelCount: "{label} {count}",
		labelEmpty: "Veldetiket kan nie leeg wees nie",
		"lang.af": "Afrikaans",
		"lang.ar": "Arabies",
		"lang.cs": "Tsjeggies",
		"lang.de": "Duits",
		"lang.en": "Engels",
		"lang.es": "Spaans",
		"lang.fa": "Persies",
		"lang.fi": "Fins",
		"lang.fr": "Frans",
		"lang.he": "Hebreeus",
		"lang.hi": "Hindi",
		"lang.hu": "Hongaars",
		"lang.it": "Italiaans",
		"lang.ja": "Japannese",
		"lang.nb": "Noorse Bokmål",
		"lang.pl": "Pools",
		"lang.pt": "Portugees",
		"lang.ro": "Roemeens",
		"lang.ru": "Russies",
		"lang.th": "Thai",
		"lang.tr": "Turks",
		"lang.zh": "Chinese",
		layout: "uitleg",
		limitRole: "Beperk toegang tot een of meer van die volgende rolle:",
		mandatory: "verpligte",
		maxlength: "Maksimum Lengte",
		"meta.group": "groep",
		"meta.icon": "Ico",
		"meta.label": "Etiket",
		minOptionMessage: "Hierdie veld benodig 'n minimum van 2 opsies",
		name: "naam",
		newOptionLabel: "Nuwe {type}",
		no: "Geen",
		number: "aantal",
		off: "af",
		on: "op",
		"operator.contains": "bevat",
		"operator.equals": "gelyk",
		"operator.notContains": "bevat nie",
		"operator.notEquals": "nie gelyk nie",
		"operator.notVisible": "nie sigbaar nie",
		"operator.visible": "sigbaar",
		option: "Opsie",
		optional: "opsioneel",
		optionEmpty: "Opsie waarde vereis",
		optionLabel: "Opsie (tel)",
		options: "opsies",
		or: "of",
		order: "Orde",
		"panel.label.attrs": "eienskappe",
		"panel.label.conditions": "voorwaardes",
		"panel.label.config": "opset",
		"panel.label.meta": "meta",
		"panel.label.options": "opsies",
		"panelEditButtons.attrs": "+ Attribuut",
		"panelEditButtons.conditions": "+ Toestand",
		"panelEditButtons.config": "+ Konfigurasie",
		"panelEditButtons.options": "+ Opsie",
		placeholder: "plekhouer",
		"placeholder.className": "spasie geskeide klasse",
		"placeholder.email": "Vul jou e-pos in",
		"placeholder.label": "Etiket",
		"placeholder.password": "Sleutel jou wagwoord in",
		"placeholder.placeholder": "plekhouer",
		"placeholder.text": "Voer 'n paar teks in",
		"placeholder.textarea": "Vul baie teks in",
		"placeholder.value": "waarde",
		preview: "voorskou",
		primary: "primêre",
		remove: "verwyder",
		removeMessage: "Verwyder Element",
		removeType: "Verwyder {tipe}",
		required: "vereis",
		reset: "herstel",
		richText: "Rich Text Editor",
		roles: "Toegang",
		row: "ry",
		"row.makeInputGroup": "Maak hierdie ry 'n invoergroep.",
		"row.makeInputGroupDesc": "Invoergroepe stel gebruikers in staat om stelle insette op 'n keer by te voeg.",
		"row.settings.fieldsetWrap": "Wrap ry in 'n <velde> tag",
		"row.settings.fieldsetWrap.aria": "Wrap Row in Fieldset",
		save: "Save",
		secondary: "sekondêre",
		select: "Kies",
		selectColor: "Kies Kleur",
		selectionsMessage: "Laat meerdere keuses toe",
		selectOptions: "opsies",
		separator: "separator",
		settings: "instellings",
		size: "grootte",
		sizes: "groottes",
		"sizes.lg": "groot",
		"sizes.m": "verstek",
		"sizes.sm": "klein",
		"sizes.xs": "Ekstra Klein",
		style: "styl",
		styles: "style",
		"styles.btn": "Knoppie styl",
		"styles.btn.danger": "gevaar",
		"styles.btn.default": "verstek",
		"styles.btn.info": "info",
		"styles.btn.primary": "primêre",
		"styles.btn.success": "sukses",
		"styles.btn.warning": "waarskuwing",
		subtype: "tipe",
		success: "sukses",
		text: "Teksveld",
		then: "dan",
		"then.condition.target.placeholder": "teiken",
		toggle: "Toggle",
		ungrouped: "A-Gegroepeer",
		warning: "waarskuwing",
		yes: "Ja"
	},
	"ar-TN": {
		"ar-TN": "العربية (تونس)",
		dir: "rtl",
		"en-US": "الإنجليزية",
		"af-ZA": "الأفريقانية (جنوب أفريقيا)",
		"cs-CZ": "التشيكية (التشيك)",
		"de-DE": "الألمانية (ألمانيا)",
		"es-ES": "الإسبانية الأوروبية",
		"fa-IR": "الفارسية (إيران)",
		"fi-FI": "الفنلندية (فنلندا)",
		"fr-FR": "الفرنسية (فرنسا)",
		"he-IL": "العبرية (إسرائيل)",
		"hi-IN": "الهندية (الهند)",
		"hu-HU": "الهنغارية (هنغاريا)",
		"it-IT": "الإيطالية (إيطاليا)",
		"ja-JP": "اليابانية (اليابان)",
		"nb-NO": "النرويجية بوكمال (النرويج)",
		"pl-PL": "البولندية (بولندا)",
		"pt-BR": "البرتغالية البرازيلية",
		"pt-PT": "البرتغالية الأوروبية",
		"ro-RO": "الرومانية (رومانيا)",
		"ru-RU": "الروسية (روسيا)",
		"th-TH": "التايلاندية (تايلاند)",
		"tr-TR": "التركية (تركيا)",
		"zh-CN": "الصينية (الصين)",
		"zh-HK": "الصينية (هونغ كونغ الصينية [منطقة إدارية خاصة])",
		"action.add.attrs.attr": "ما هي السمة التي ترغب بإضافتها؟",
		"action.add.attrs.value": "القيمة الافتراضية",
		addOption: "إضافة خيار",
		allFieldsRemoved: "تمّت إزالة جميع المجالات..",
		allowSelect: "السماح بالإختيار",
		and: "و",
		attribute: "يصف",
		attributeNotPermitted: "لا يُسمح بالسمة \"{attribute}\"، يرجى اختيار سمة أخرى.",
		attributes: "صفات",
		"attrs.class": "فصل",
		"attrs.className": "فصل",
		"attrs.dir": "اتجاه",
		"attrs.id": "بطاقة تعريف",
		"attrs.required": "مطلوب",
		"attrs.style": "أسلوب",
		"attrs.title": "عنوان",
		"attrs.type": "يكتب",
		"attrs.value": "قيمة",
		autocomplete: "الإكمال التلقائي",
		button: "زر",
		cancel: "يلغي",
		cannotBeEmpty: "هذه المعلومة لا يمكن أن تكون فارغة",
		cannotClearFields: "لا توجد حقول لمسحها",
		checkbox: "خانة الاختيار",
		checkboxes: "خانات إختيار",
		class: "صنف",
		clear: "إفسخ",
		clearAllMessage: "هل أنت متأكد أنك تريد مسح كافة المعلومات؟",
		close: "أغلق",
		column: "عمود",
		"condition.target.placeholder": "هدف",
		"condition.type.and": "و",
		"condition.type.if": "لو",
		"condition.type.or": "أو",
		"condition.type.then": "ثم",
		"condition.value.placeholder": "قيمة",
		confirmClearAll: "هل أنت متأكد أنك تريد إزالة كافة الحقول؟",
		content: "محتوى",
		control: "يتحكم",
		"controlGroups.nextGroup": "المجموعة التالية",
		"controlGroups.prevGroup": "المجموعة السابقة",
		"controls.filteringTerm": "تصفية \"{term}\"",
		"controls.form.button": "زر",
		"controls.form.checkbox-group": "مجموعة خانات الاختيار",
		"controls.form.input.date": "تاريخ",
		"controls.form.input.email": "بريد إلكتروني",
		"controls.form.input.file": "تحميل الملف",
		"controls.form.input.hidden": "المدخلات المخفية",
		"controls.form.input.number": "رقم",
		"controls.form.input.text": "إدخال النص",
		"controls.form.radio-group": "مجموعة الراديو",
		"controls.form.select": "يختار",
		"controls.form.textarea": "منطقة النص",
		"controls.groups.form": "حقول النموذج",
		"controls.groups.html": "عناصر HTML",
		"controls.groups.layout": "تَخطِيط",
		"controls.html.divider": "فاصل",
		"controls.html.header": "رأس الصفحة",
		"controls.html.paragraph": "فقرة",
		"controls.layout.column": "عمود",
		"controls.layout.row": "صف",
		copy: "نسخ إلى الحافظة",
		danger: "خطر",
		defineColumnLayout: "تحديد تخطيط العمود",
		defineColumnWidths: "تحديد عرض الأعمدة",
		description: "نص المساعدة",
		descriptionField: "وصف",
		"editing.row": "تحرير الصف",
		editorTitle: "عناصر النموذج",
		field: "مجال",
		"field.property.invalid": "غير صالح",
		"field.property.isChecked": "تم التحقق",
		"field.property.isNotVisible": "غير مرئي",
		"field.property.isVisible": "هو مرئي",
		"field.property.label": "ملصق",
		"field.property.valid": "صالح",
		"field.property.value": "قيمة",
		fieldNonEditable: "هذا الحقل لا يمكن تعديله.",
		fieldRemoveWarning: "هل حقا تريد حذف هذا المجال؟",
		fileUpload: "تحميل الملف",
		formUpdated: "تّم تحديث الإستمارة",
		getStarted: "إسحب إختيار(حقل) من اليمين إلى هذا المجال",
		group: "مجموعة",
		grouped: "مجمعة",
		hidden: "الإدخال مخفي",
		hide: "تحديث",
		htmlElements: "عناصر HTML",
		if: "لو",
		"if.condition.source.placeholder": "مصدر",
		"if.condition.target.placeholder": "الهدف / القيمة",
		info: "معلومات",
		"input.date": "تاريخ",
		"input.text": "نص",
		label: "التسمية",
		labelCount: "{التسمية} {العدد}",
		labelEmpty: "التسمية لا يمكن أن يكون فارغا",
		"lang.af": "الأفريقي",
		"lang.ar": "عربي",
		"lang.cs": "التشيكية",
		"lang.de": "الألمانية",
		"lang.en": "إنجليزي",
		"lang.es": "الأسبانية",
		"lang.fa": "الفارسية",
		"lang.fi": "الفنلندية",
		"lang.fr": "فرنسي",
		"lang.he": "العبرية",
		"lang.hi": "الهندية",
		"lang.hu": "المجرية",
		"lang.it": "ايطالي",
		"lang.ja": "اليابانية",
		"lang.nb": "البوكمال النرويجية",
		"lang.pl": "بولندي",
		"lang.pt": "البرتغالية",
		"lang.ro": "روماني",
		"lang.ru": "الروسية",
		"lang.th": "تايلاندي",
		"lang.tr": "اللغة التركية",
		"lang.zh": "الصينية",
		layout: "تَخطِيط",
		limitRole: "تقييد الوصول إلى واحد أو أكثر من الأدوار التالية:",
		mandatory: "إلزامي",
		maxlength: "الحد الاقصى للطول",
		"meta.group": "مجموعة",
		"meta.icon": "إيكو",
		"meta.label": "ملصق",
		minOptionMessage: "يتطلب هذا المجال لا تقل عن 2 خيارات",
		name: "الإسم",
		newOptionLabel: "نوع جديد",
		no: "لا",
		number: "رقم",
		off: "عاطل",
		on: "مفعل",
		"operator.contains": "يتضمن",
		"operator.equals": "يساوي",
		"operator.notContains": "لا يحتوي على",
		"operator.notEquals": "ليس متساويا",
		"operator.notVisible": "غير مرئي",
		"operator.visible": "مرئي",
		option: "خيار",
		optional: "خيار",
		optionEmpty: "قيمة الخيار المطلوبة",
		optionLabel: "الخيار {العدد}",
		options: "خيارات",
		or: "أو",
		order: "طلب",
		"panel.label.attrs": "صفات",
		"panel.label.conditions": "شروط",
		"panel.label.config": "إعدادات",
		"panel.label.meta": "ميتا",
		"panel.label.options": "خيارات",
		"panelEditButtons.attrs": "+ السمة",
		"panelEditButtons.conditions": "+ الحالة",
		"panelEditButtons.config": "+ التكوين",
		"panelEditButtons.options": "+ خيار",
		placeholder: "العنصر النائب",
		"placeholder.className": "فئات مفصولة بمسافات",
		"placeholder.email": "أدخل البريد الإلكتروني",
		"placeholder.label": "تسمية",
		"placeholder.password": "أدخل كلمة المرور",
		"placeholder.placeholder": "العنصر النائب",
		"placeholder.text": "أدخل بعض النص",
		"placeholder.textarea": "إدخال الكثير من النص",
		"placeholder.value": "القيمة",
		preview: "المعاينة",
		primary: "أساسي",
		remove: "&#215;",
		removeMessage: "إزالة عنصر",
		removeType: "إزالة {النوع}",
		required: "إجبارية",
		reset: "إعادة ضبط",
		richText: "محرر WYSIWYG",
		roles: "وصول",
		row: "صف",
		"row.makeInputGroup": "اجعل هذا الصف مجموعة إدخال.",
		"row.makeInputGroupDesc": "تتيح مجموعات الإدخال للمستخدمين إضافة مجموعات من المدخلات في وقت واحد.",
		"row.settings.fieldsetWrap": "لف الصف في علامة &lt;fieldset&gt;",
		"row.settings.fieldsetWrap.aria": "لف الصف في مجموعة الحقول",
		save: "حفظ",
		secondary: "ثانوي",
		select: "للاختيار",
		selectColor: "اختيار اللون",
		selectionsMessage: "سماح اختيارات متعددة",
		selectOptions: "خيارات",
		separator: "فاصل",
		settings: "إعدادات",
		size: "حجم",
		sizes: "الأحجام",
		"sizes.lg": "كبير",
		"sizes.m": "تبعا للإعدادات الافتراضية",
		"sizes.sm": "صغير",
		"sizes.xs": "صغيرة اضافية",
		style: "شكل",
		styles: "الأشكال",
		"styles.btn": "شكل الزر",
		"styles.btn.danger": "خطر",
		"styles.btn.default": "تبعا للإعدادات الافتراضية",
		"styles.btn.info": "معلومات",
		"styles.btn.primary": "أساسي",
		"styles.btn.success": "نجاح",
		"styles.btn.warning": "إعلام",
		subtype: "نوع",
		success: "نجاح",
		text: "الميدان النص",
		then: "ثم",
		"then.condition.target.placeholder": "هدف",
		toggle: "نوع التبديل",
		ungrouped: "غير مجمعة",
		warning: "تحذير!",
		yes: "نعم"
	},
	"cs-CZ": {
		"cs-CZ": "čeština (Česko)",
		dir: "ltr",
		"en-US": "angličtina",
		"af-ZA": "afrikánština (Jihoafrická republika)",
		"ar-TN": "arabština (Tunisko)",
		"de-DE": "němčina (Německo)",
		"es-ES": "španělština (Evropa)",
		"fa-IR": "perština (Írán)",
		"fi-FI": "finština (Finsko)",
		"fr-FR": "francouzština (Francie)",
		"he-IL": "hebrejština (Izrael)",
		"hi-IN": "hindština (Indie)",
		"hu-HU": "maďarština (Maďarsko)",
		"it-IT": "italština (Itálie)",
		"ja-JP": "japonština (Japonsko)",
		"nb-NO": "norština (bokmål) (Norsko)",
		"pl-PL": "polština (Polsko)",
		"pt-BR": "portugalština (Brazílie)",
		"pt-PT": "portugalština (Evropa)",
		"ro-RO": "rumunština (Rumunsko)",
		"ru-RU": "ruština (Rusko)",
		"th-TH": "thajština (Thajsko)",
		"tr-TR": "turečtina (Turecko)",
		"zh-CN": "čínština (Čína)",
		"zh-HK": "čínština (Hongkong – ZAO Číny)",
		"action.add.attrs.attr": "Jaký atribut byste chtěli přidat?",
		"action.add.attrs.value": "Výchozí hodnota",
		addOption: "Přidat možnost",
		allFieldsRemoved: "Všechna pole byla odstraněna.",
		allowSelect: "Povolit Vybrat",
		and: "a",
		attribute: "Atribut",
		attributeNotPermitted: "Atribut \"{attribute}\" není povolen, vyberte prosím jiný.",
		attributes: "Atributy",
		"attrs.class": "Třída",
		"attrs.className": "Třída",
		"attrs.dir": "Směr",
		"attrs.id": "Id",
		"attrs.required": "Požadovaný",
		"attrs.style": "Styl",
		"attrs.title": "Titul",
		"attrs.type": "Typ",
		"attrs.value": "Hodnota",
		autocomplete: "Automatické doplňování",
		button: "Tlačítko",
		cancel: "Zrušit",
		cannotBeEmpty: "Toto pole nemůže být prázdné",
		cannotClearFields: "Nejsou zde žádná pole k vymazání",
		checkbox: "Zaškrtávací políčko",
		checkboxes: "Zaškrtávací políčka",
		class: "Třída",
		clear: "Jasný",
		clearAllMessage: "Opravdu chcete vymazat všechna pole?",
		close: "Blízko",
		column: "Sloupec",
		"condition.target.placeholder": "cíl",
		"condition.type.and": "A",
		"condition.type.if": "Li",
		"condition.type.or": "Nebo",
		"condition.type.then": "Pak",
		"condition.value.placeholder": "hodnota",
		confirmClearAll: "Opravdu chcete odstranit všechna pole?",
		content: "Obsah",
		control: "Řízení",
		"controlGroups.nextGroup": "Další skupina",
		"controlGroups.prevGroup": "Předchozí skupina",
		"controls.filteringTerm": "Filtrování „{term}“",
		"controls.form.button": "Tlačítko",
		"controls.form.checkbox-group": "Skupina zaškrtávacích políček",
		"controls.form.input.date": "Datum",
		"controls.form.input.email": "E-mail",
		"controls.form.input.file": "Nahrání souboru",
		"controls.form.input.hidden": "Skrytý vstup",
		"controls.form.input.number": "Číslo",
		"controls.form.input.text": "Textový vstup",
		"controls.form.radio-group": "Rozhlasová skupina",
		"controls.form.select": "Vybrat",
		"controls.form.textarea": "TextArea",
		"controls.groups.form": "Pole formuláře",
		"controls.groups.html": "HTML prvky",
		"controls.groups.layout": "Rozložení",
		"controls.html.divider": "Dělič",
		"controls.html.header": "Záhlaví",
		"controls.html.paragraph": "Odstavec",
		"controls.layout.column": "Sloupec",
		"controls.layout.row": "Řádek",
		copy: "Kopírovat do schránky",
		danger: "Nebezpečí",
		defineColumnLayout: "Definujte rozvržení sloupců",
		defineColumnWidths: "Definujte šířky sloupců",
		description: "Text nápovědy",
		descriptionField: "Popis",
		"editing.row": "Editace řádku",
		editorTitle: "Prvky formuláře",
		field: "Pole",
		"field.property.invalid": "neplatí",
		"field.property.isChecked": "je zaškrtnuto",
		"field.property.isNotVisible": "není vidět",
		"field.property.isVisible": "je vidět",
		"field.property.label": "označení",
		"field.property.valid": "platný",
		"field.property.value": "hodnota",
		fieldNonEditable: "Toto pole nelze upravit.",
		fieldRemoveWarning: "Opravdu chcete toto pole odstranit?",
		fileUpload: "Nahrání souboru",
		formUpdated: "Formulář aktualizován",
		getStarted: "Začněte přetažením pole zprava.",
		group: "Skupina",
		grouped: "Seskupené",
		hidden: "Skrytý vstup",
		hide: "Upravit",
		htmlElements: "HTML prvky",
		if: "Li",
		"if.condition.source.placeholder": "zdroj",
		"if.condition.target.placeholder": "cíl / hodnota",
		info: "Info",
		"input.date": "Datum",
		"input.text": "Text",
		label: "Označení",
		labelCount: "{label} {count}",
		labelEmpty: "Štítek pole nemůže být prázdný",
		"lang.af": "Afričan",
		"lang.ar": "arabština",
		"lang.cs": "čeština",
		"lang.de": "Němec",
		"lang.en": "angličtina",
		"lang.es": "španělština",
		"lang.fa": "Peršan",
		"lang.fi": "finština",
		"lang.fr": "francouzština",
		"lang.he": "hebrejština",
		"lang.hi": "hindština",
		"lang.hu": "maďarský",
		"lang.it": "italština",
		"lang.ja": "japonský",
		"lang.nb": "norský bokmål",
		"lang.pl": "polština",
		"lang.pt": "portugalština",
		"lang.ro": "rumunština",
		"lang.ru": "ruština",
		"lang.th": "thajština",
		"lang.tr": "turečtina",
		"lang.zh": "čínština",
		layout: "Rozložení",
		limitRole: "Omezte přístup k jedné nebo více z následujících rolí:",
		mandatory: "Povinné",
		maxlength: "Maximální délka",
		"meta.group": "Skupina",
		"meta.icon": "Ico",
		"meta.label": "Označení",
		minOptionMessage: "Toto pole vyžaduje minimálně 2 možnosti",
		name: "Jméno",
		newOptionLabel: "Nový {type}",
		no: "Žádný",
		number: "Číslo",
		off: "Vypnuto",
		on: "Na",
		"operator.contains": "obsahuje",
		"operator.equals": "rovná se",
		"operator.notContains": "neobsahuje",
		"operator.notEquals": "ne rovné",
		"operator.notVisible": "není vidět",
		"operator.visible": "viditelné",
		option: "Volba",
		optional: "volitelný",
		optionEmpty: "Je vyžadována hodnota opce",
		optionLabel: "Možnost {count}",
		options: "Možnosti",
		or: "nebo",
		order: "Objednávka",
		"panel.label.attrs": "Atributy",
		"panel.label.conditions": "Podmínky",
		"panel.label.config": "Konfigurace",
		"panel.label.meta": "Meta",
		"panel.label.options": "Možnosti",
		"panelEditButtons.attrs": "+ Atribut",
		"panelEditButtons.conditions": "+ Stav",
		"panelEditButtons.config": "+ Konfigurace",
		"panelEditButtons.options": "+ Možnost",
		placeholder: "Zástupný symbol",
		"placeholder.className": "prostorově oddělené třídy",
		"placeholder.email": "Zadejte svůj email",
		"placeholder.label": "Označení",
		"placeholder.password": "Zadejte své heslo",
		"placeholder.placeholder": "Zástupný symbol",
		"placeholder.text": "Zadejte nějaký text",
		"placeholder.textarea": "Zadejte hodně textu",
		"placeholder.value": "Hodnota",
		preview: "Náhled",
		primary: "Primární",
		remove: "Odstranit",
		removeMessage: "Odebrat prvek",
		removeType: "Odebrat {type}",
		required: "Požadovaný",
		reset: "Resetovat",
		richText: "Rich Text Editor",
		roles: "Přístup",
		row: "Řádek",
		"row.makeInputGroup": "Udělejte z tohoto řádku vstupní skupinu.",
		"row.makeInputGroupDesc": "Skupiny vstupů umožňují uživatelům přidávat sady vstupů najednou.",
		"row.settings.fieldsetWrap": "Zabalte řádek do sady &lt;fieldset&gt; štítek",
		"row.settings.fieldsetWrap.aria": "Zabalte řádek do sady polí",
		save: "Uložit",
		secondary: "Sekundární",
		select: "Vybrat",
		selectColor: "Vyberte Barva",
		selectionsMessage: "Povolit vícenásobný výběr",
		selectOptions: "Možnosti",
		separator: "Oddělovač",
		settings: "Nastavení",
		size: "Velikost",
		sizes: "Velikosti",
		"sizes.lg": "Velký",
		"sizes.m": "Výchozí",
		"sizes.sm": "Malý",
		"sizes.xs": "Extra malý",
		style: "Styl",
		styles: "Styly",
		"styles.btn": "Styl tlačítka",
		"styles.btn.danger": "Nebezpečí",
		"styles.btn.default": "Výchozí",
		"styles.btn.info": "Info",
		"styles.btn.primary": "Primární",
		"styles.btn.success": "Úspěch",
		"styles.btn.warning": "Varování",
		subtype: "Typ",
		success: "Úspěch",
		text: "Textové pole",
		then: "Pak",
		"then.condition.target.placeholder": "cíl",
		toggle: "Přepnout",
		ungrouped: "Un-grouped",
		warning: "Varování",
		yes: "Ano"
	},
	"de-DE": {
		"de-DE": "Deutsch (Deutschland)",
		dir: "ltr",
		"en-US": "Englisch",
		"af-ZA": "Afrikaans (Südafrika)",
		"ar-TN": "Arabisch (Tunesien)",
		"cs-CZ": "Tschechisch (Tschechien)",
		"es-ES": "Spanisch (Spanien)",
		"fa-IR": "Persisch (Iran)",
		"fi-FI": "Finnisch (Finnland)",
		"fr-FR": "Französisch (Frankreich)",
		"he-IL": "Hebräisch (Israel)",
		"hi-IN": "Hindi (Indien)",
		"hu-HU": "Ungarisch (Ungarn)",
		"it-IT": "Italienisch (Italien)",
		"ja-JP": "Japanisch (Japan)",
		"nb-NO": "Norwegisch (Bokmål) (Norwegen)",
		"pl-PL": "Polnisch (Polen)",
		"pt-BR": "Portugiesisch (Brasilien)",
		"pt-PT": "Portugiesisch (Portugal)",
		"ro-RO": "Rumänisch (Rumänien)",
		"ru-RU": "Russisch (Russland)",
		"th-TH": "Thailändisch (Thailand)",
		"tr-TR": "Türkisch (Türkei)",
		"zh-CN": "Chinesisch (China)",
		"zh-HK": "Chinesisch (Sonderverwaltungsregion Hongkong)",
		"action.add.attrs.attr": "Welches Attribut möchten Sie hinzufügen?",
		"action.add.attrs.value": "Standardwert",
		addOption: "Option hinzufügen",
		allFieldsRemoved: "Alle Felder wurden entfernt.",
		allowSelect: "Auswahl zulassen",
		and: "und",
		attribute: "Attribut",
		attributeNotPermitted: "Attribut \"{Attribut}\" ist nicht zulässig, bitte wählen Sie ein anderes.",
		attributes: "Attribute",
		"attrs.class": "Klasse",
		"attrs.className": "Klasse",
		"attrs.dir": "Richtung",
		"attrs.id": "Ich würde",
		"attrs.required": "Erforderlich",
		"attrs.style": "Stil",
		"attrs.title": "Titel",
		"attrs.type": "Art",
		"attrs.value": "Wert",
		autocomplete: "Autovervollständigung",
		button: "Taste",
		cancel: "Stornieren",
		cannotBeEmpty: "Dieses Feld kann nicht leer sein",
		cannotClearFields: "Es gibt keine zu löschenden Felder",
		checkbox: "Ankreuzfeld",
		checkboxes: "Ankreuzfelder",
		class: "Klasse",
		clear: "klar",
		clearAllMessage: "Möchten Sie wirklich alle Felder löschen?",
		close: "Schließen",
		column: "Säule",
		"condition.target.placeholder": "Ziel",
		"condition.type.and": "Und",
		"condition.type.if": "Wenn",
		"condition.type.or": "Oder",
		"condition.type.then": "Dann",
		"condition.value.placeholder": "Wert",
		confirmClearAll: "Möchten Sie wirklich alle Felder entfernen?",
		content: "Inhalt",
		control: "Steuerung",
		"controlGroups.nextGroup": "Nächste Gruppe",
		"controlGroups.prevGroup": "Vorherige Gruppe",
		"controls.filteringTerm": "Filtern \"{Begriff}\"",
		"controls.form.button": "Taste",
		"controls.form.checkbox-group": "Kontrollkästchen Gruppe",
		"controls.form.input.date": "Datum",
		"controls.form.input.email": "Email",
		"controls.form.input.file": "Datei-Upload",
		"controls.form.input.hidden": "Versteckte Eingabe",
		"controls.form.input.number": "Nummer",
		"controls.form.input.text": "Text Eingabe",
		"controls.form.radio-group": "Radio-Gruppe",
		"controls.form.select": "Wählen",
		"controls.form.textarea": "TextArea",
		"controls.groups.form": "Formularfelder",
		"controls.groups.html": "HTML-Elemente",
		"controls.groups.layout": "Layout",
		"controls.html.divider": "Teiler",
		"controls.html.header": "Header",
		"controls.html.paragraph": "Absatz",
		"controls.layout.column": "Säule",
		"controls.layout.row": "Reihe",
		copy: "In die Zwischenablage kopieren",
		danger: "Achtung",
		defineColumnLayout: "Definieren Sie ein Spaltenlayout",
		defineColumnWidths: "Spaltenbreiten definieren",
		description: "Hilfstext",
		descriptionField: "Beschreibung",
		"editing.row": "Zeile bearbeiten",
		editorTitle: "Formularelemente",
		field: "Feld",
		"field.property.invalid": "ungültig",
		"field.property.isChecked": "wird geprüft",
		"field.property.isNotVisible": "ist nicht sichtbar",
		"field.property.isVisible": "ist sichtbar",
		"field.property.label": "Etikette",
		"field.property.valid": "gültig",
		"field.property.value": "Wert",
		fieldNonEditable: "Dieses Feld kann nicht bearbeitet werden.",
		fieldRemoveWarning: "Möchten Sie dieses Feld wirklich entfernen?",
		fileUpload: "Datei-Upload",
		formUpdated: "Formular aktualisiert",
		getStarted: "Ziehen Sie ein Feld von rechts, um zu beginnen.",
		group: "Gruppe",
		grouped: "Gruppiert",
		hidden: "Versteckte Eingabe",
		hide: "Bearbeiten",
		htmlElements: "HTML-Elemente",
		if: "Ob",
		"if.condition.source.placeholder": "Quelle",
		"if.condition.target.placeholder": "Zielwert",
		info: "Info",
		"input.date": "Datum",
		"input.text": "Text",
		label: "Etikette",
		labelCount: "{label} {count}",
		labelEmpty: "Feldbezeichnung darf nicht leer sein",
		"lang.af": "afrikanisch",
		"lang.ar": "Arabisch",
		"lang.cs": "tschechisch",
		"lang.de": "Deutsch",
		"lang.en": "Englisch",
		"lang.es": "Spanisch",
		"lang.fa": "persisch",
		"lang.fi": "finnisch",
		"lang.fr": "Französisch",
		"lang.he": "Hebräisch",
		"lang.hi": "Hindi",
		"lang.hu": "ungarisch",
		"lang.it": "Italienisch",
		"lang.ja": "japanisch",
		"lang.nb": "Norwegisches Bokmål",
		"lang.pl": "Polieren",
		"lang.pt": "Portugiesisch",
		"lang.ro": "rumänisch",
		"lang.ru": "Russisch",
		"lang.th": "Thai",
		"lang.tr": "Türkisch",
		"lang.zh": "chinesisch",
		layout: "Layout",
		limitRole: "Beschränken Sie den Zugriff auf eine oder mehrere der folgenden Rollen:",
		mandatory: "Verpflichtend",
		maxlength: "Maximale Länge",
		"meta.group": "Gruppe",
		"meta.icon": "Ico",
		"meta.label": "Etikette",
		minOptionMessage: "Dieses Feld erfordert mindestens 2 Optionen",
		name: "Name",
		newOptionLabel: "Neuer Typ}",
		no: "Nein",
		number: "Nummer",
		off: "aus",
		on: "Auf",
		"operator.contains": "enthält",
		"operator.equals": "gleich",
		"operator.notContains": "enthält nicht",
		"operator.notEquals": "nicht gleich",
		"operator.notVisible": "nicht sichtbar",
		"operator.visible": "sichtbar",
		option: "Möglichkeit",
		optional: "wahlweise",
		optionEmpty: "Optionswert erforderlich",
		optionLabel: "Option {count}",
		options: "Optionen",
		or: "oder",
		order: "Auftrag",
		"panel.label.attrs": "Attribute",
		"panel.label.conditions": "Bedingungen",
		"panel.label.config": "Aufbau",
		"panel.label.meta": "Meta",
		"panel.label.options": "Optionen",
		"panelEditButtons.attrs": "+ Attribut",
		"panelEditButtons.conditions": "+ Bedingung",
		"panelEditButtons.config": "+ Konfiguration",
		"panelEditButtons.options": "+ Wahl",
		placeholder: "Platzhalter",
		"placeholder.className": "Leerzeichen getrennte Klassen",
		"placeholder.email": "Geben Sie Ihre E-Mail ein",
		"placeholder.label": "Etikette",
		"placeholder.password": "Geben Sie Ihr Passwort ein",
		"placeholder.placeholder": "Platzhalter",
		"placeholder.text": "Geben Sie einen Text ein",
		"placeholder.textarea": "Geben Sie viel Text ein",
		"placeholder.value": "Wert",
		preview: "Vorschau",
		primary: "Primär",
		remove: "Löschen",
		removeMessage: "Element entfernen",
		removeType: "{Type} entfernen",
		required: "Erforderlich",
		reset: "Zurücksetzen",
		richText: "Rich-Text-Editor",
		roles: "Zugriff",
		row: "Reihe",
		"row.makeInputGroup": "Machen Sie diese Zeile zu einer Eingabegruppe.",
		"row.makeInputGroupDesc": "Eingabegruppen ermöglichen Benutzern das Hinzufügen von Eingabesätzen gleichzeitig.",
		"row.settings.fieldsetWrap": "Zeilenumbruch in einem & lt; -Feldset & gt; Etikett",
		"row.settings.fieldsetWrap.aria": "Zeile in Fieldset umbrechen",
		save: "sparen",
		secondary: "Sekundär",
		select: "Wählen",
		selectColor: "Wähle Farbe",
		selectionsMessage: "Mehrfachauswahl zulassen",
		selectOptions: "Optionen",
		separator: "Separator",
		settings: "die Einstellungen",
		size: "Größe",
		sizes: "Größen",
		"sizes.lg": "Groß",
		"sizes.m": "Standard",
		"sizes.sm": "Klein",
		"sizes.xs": "Extra klein",
		style: "Stil",
		styles: "Styles",
		"styles.btn": "Button Style",
		"styles.btn.danger": "Achtung",
		"styles.btn.default": "Standard",
		"styles.btn.info": "Info",
		"styles.btn.primary": "Primär",
		"styles.btn.success": "Erfolg",
		"styles.btn.warning": "Warnung",
		subtype: "Art",
		success: "Erfolg",
		text: "Textfeld",
		then: "Dann",
		"then.condition.target.placeholder": "Ziel",
		toggle: "Umschalten",
		ungrouped: "A-gruppierte",
		warning: "Warnung",
		yes: "Ja"
	},
	"en-US": {
		"en-US": "English",
		dir: "ltr",
		"af-ZA": "Afrikaans (South Africa)",
		"ar-TN": "Arabic (Tunisia)",
		"cs-CZ": "Czech (Czechia)",
		"de-DE": "German (Germany)",
		"es-ES": "European Spanish",
		"fa-IR": "Persian (Iran)",
		"fi-FI": "Finnish (Finland)",
		"fr-FR": "French (France)",
		"hu-HU": "Hungarian (Hungary)",
		"it-IT": "Italian (Italy)",
		"ja-JP": "Japanese (Japan)",
		"nb-NO": "Norwegian Bokmål (Norway)",
		"pl-PL": "Polish (Poland)",
		"pt-BR": "Brazilian Portuguese",
		"pt-PT": "European Portuguese",
		"ro-RO": "Romanian (Romania)",
		"ru-RU": "Russian (Russia)",
		"th-TH": "Thai (Thailand)",
		"tr-TR": "Turkish (Türkiye)",
		"zh-CN": "Chinese (China)",
		"zh-HK": "Chinese (Hong Kong SAR China)",
		"action.add.attrs.attr": "What attribute would you like to add?",
		"action.add.attrs.value": "Default Value",
		addOption: "Add Option",
		allFieldsRemoved: "All fields were removed.",
		allowSelect: "Allow Select",
		and: "and",
		attribute: "Attribute",
		attributeNotPermitted: "Attribute \"{attribute}\" is not permitted, please choose another.",
		attributes: "Attributes",
		"attrs.class": "Class",
		"attrs.className": "Class",
		"attrs.dir": "Direction",
		"attrs.id": "Id",
		"attrs.required": "Required",
		"attrs.style": "Style",
		"attrs.title": "Title",
		"attrs.type": "Type",
		"attrs.value": "Value",
		autocomplete: "Autocomplete",
		button: "Button",
		cannotBeEmpty: "This field cannot be empty",
		cannotClearFields: "There are no fields to clear",
		checkbox: "Checkbox",
		checkboxes: "Checkboxes",
		class: "Class",
		clear: "Clear",
		clearAllMessage: "Are you sure you want to clear all fields?",
		close: "Close",
		column: "Column",
		"condition.target.placeholder": "target",
		"condition.type.and": "And",
		"condition.type.if": "If",
		"condition.type.or": "Or",
		"condition.type.then": "Then",
		"condition.value.placeholder": "value",
		confirmClearAll: "Are you sure you want to remove all fields?",
		content: "Content",
		control: "Control",
		"controlGroups.nextGroup": "Next Group",
		"controlGroups.prevGroup": "Previous Group",
		"controls.filteringTerm": "Filtering \"{term}\"",
		"controls.form.button": "Button",
		"controls.form.checkbox-group": "Checkbox Group",
		"controls.form.input.date": "Date",
		"controls.form.input.email": "Email",
		"controls.form.input.file": "File Upload",
		"controls.form.input.hidden": "Hidden Input",
		"controls.form.input.number": "Number",
		"controls.form.input.text": "Text Input",
		"controls.form.radio-group": "Radio Group",
		"controls.form.select": "Select",
		"controls.form.textarea": "TextArea",
		"controls.groups.form": "Form Fields",
		"controls.groups.html": "HTML Elements",
		"controls.groups.layout": "Layout",
		"controls.html.divider": "Divider",
		"controls.html.header": "Header",
		"controls.html.paragraph": "Paragraph",
		"controls.layout.column": "Column",
		"controls.layout.row": "Row",
		copy: "Copy To Clipboard",
		danger: "Danger",
		defineColumnLayout: "Define a column layout",
		defineColumnWidths: "Define column widths",
		description: "Help Text",
		descriptionField: "Description",
		"editing.row": "Editing Row",
		editorTitle: "Form Elements",
		field: "Field",
		"field.property.invalid": "not valid",
		"field.property.isChecked": "is checked",
		"field.property.isNotVisible": "is not visible",
		"field.property.isVisible": "is visible",
		"field.property.label": "label",
		"field.property.valid": "valid",
		"field.property.value": "value",
		fieldNonEditable: "This field cannot be edited.",
		fieldRemoveWarning: "Are you sure you want to remove this field?",
		fileUpload: "File Upload",
		formUpdated: "Form Updated",
		getStarted: "Drag a field from the right to get started.",
		group: "Group",
		grouped: "Grouped",
		hidden: "Hidden Input",
		hide: "Edit",
		htmlElements: "HTML Elements",
		if: "If",
		"if.condition.source.placeholder": "source",
		"if.condition.target.placeholder": "target / value",
		info: "Info",
		"input.date": "Date",
		"input.text": "Text",
		label: "Label",
		labelCount: "{label} {count}",
		labelEmpty: "Field Label cannot be empty",
		"lang.af": "Afrikaans",
		"lang.ar": "Arabic",
		"lang.cs": "Czech",
		"lang.de": "German",
		"lang.en": "English",
		"lang.es": "Spanish",
		"lang.fa": "Persian",
		"lang.fi": "Finnish",
		"lang.fr": "French",
		"lang.hu": "Hungarian",
		"lang.it": "Italian",
		"lang.ja": "Japanese",
		"lang.nb": "Norwegian Bokmål",
		"lang.pl": "Polish",
		"lang.pt": "Portuguese",
		"lang.ro": "Romanian",
		"lang.ru": "Russian",
		"lang.th": "Thai",
		"lang.tr": "Turkish",
		"lang.zh": "Chinese",
		layout: "Layout",
		limitRole: "Limit access to one or more of the following roles:",
		mandatory: "Mandatory",
		maxlength: "Max Length",
		"meta.group": "Group",
		"meta.icon": "Ico",
		"meta.label": "Label",
		minOptionMessage: "This field requires a minimum of 2 options",
		name: "Name",
		newOptionLabel: "New {type}",
		no: "No",
		number: "Number",
		off: "Off",
		on: "On",
		"operator.contains": "contains",
		"operator.equals": "equals",
		"operator.notContains": "not contains",
		"operator.notEquals": "not equal",
		"operator.notVisible": "not visible",
		"operator.visible": "visible",
		option: "Option",
		optional: "optional",
		optionEmpty: "Option value required",
		optionLabel: "Option {count}",
		options: "Options",
		or: "or",
		order: "Order",
		"panel.label.attrs": "Attributes",
		"panel.label.conditions": "Conditions",
		"panel.label.config": "Configuration",
		"panel.label.meta": "Meta",
		"panel.label.options": "Options",
		"panelEditButtons.attrs": "+ Attribute",
		"panelEditButtons.conditions": "+ Condition",
		"panelEditButtons.options": "+ Option",
		"panelEditButtons.config": "+ Configuration",
		placeholder: "Placeholder",
		"placeholder.className": "space separated classes",
		"placeholder.email": "Enter you email",
		"placeholder.label": "Label",
		"placeholder.password": "Enter your password",
		"placeholder.placeholder": "Placeholder",
		"placeholder.text": "Enter some Text",
		"placeholder.textarea": "Enter a lot of text",
		"placeholder.value": "Value",
		preview: "Preview",
		primary: "Primary",
		remove: "Remove",
		removeMessage: "Remove Element",
		removeType: "Remove {type}",
		required: "Required",
		reset: "Reset",
		richText: "Rich Text Editor",
		roles: "Access",
		row: "Row",
		"row.makeInputGroup": "Make this row an input group.",
		"row.makeInputGroupDesc": "Input Groups enable users to add sets of inputs at a time.",
		"row.settings.fieldsetWrap": "Wrap row in a &lt;fieldset&gt; tag",
		"row.settings.fieldsetWrap.aria": "Wrap Row in Fieldset",
		save: "Save",
		cancel: "Cancel",
		secondary: "Secondary",
		select: "Select",
		selectColor: "Select Color",
		selectionsMessage: "Allow Multiple Selections",
		selectOptions: "Options",
		separator: "Separator",
		settings: "Settings",
		size: "Size",
		sizes: "Sizes",
		"sizes.lg": "Large",
		"sizes.m": "Default",
		"sizes.sm": "Small",
		"sizes.xs": "Extra Small",
		style: "Style",
		styles: "Styles",
		"styles.btn": "Button Style",
		"styles.btn.danger": "Danger",
		"styles.btn.default": "Default",
		"styles.btn.info": "Info",
		"styles.btn.primary": "Primary",
		"styles.btn.success": "Success",
		"styles.btn.warning": "Warning",
		subtype: "Type",
		success: "Success",
		text: "Text Field",
		then: "Then",
		"then.condition.target.placeholder": "target",
		toggle: "Toggle",
		ungrouped: "Un-Grouped",
		warning: "Warning",
		yes: "Yes"
	},
	"es-ES": {
		"es-ES": "español de España",
		dir: "ltr",
		"en-US": "Inglés",
		"af-ZA": "afrikáans (Sudáfrica)",
		"ar-TN": "árabe (Túnez)",
		"cs-CZ": "checo (Chequia)",
		"de-DE": "alemán (Alemania)",
		"fa-IR": "persa (Irán)",
		"fi-FI": "finés (Finlandia)",
		"fr-FR": "francés (Francia)",
		"he-IL": "hebreo (Israel)",
		"hi-IN": "hindi (India)",
		"hu-HU": "húngaro (Hungría)",
		"it-IT": "italiano (Italia)",
		"ja-JP": "japonés (Japón)",
		"nb-NO": "noruego bokmal (Noruega)",
		"pl-PL": "polaco (Polonia)",
		"pt-BR": "portugués de Brasil",
		"pt-PT": "portugués de Portugal",
		"ro-RO": "rumano (Rumanía)",
		"ru-RU": "ruso (Rusia)",
		"th-TH": "tailandés (Tailandia)",
		"tr-TR": "turco (Turquía)",
		"zh-CN": "chino (China)",
		"zh-HK": "chino (RAE de Hong Kong [China])",
		"action.add.attrs.attr": "¿Qué atributo te gustaría agregar?",
		"action.add.attrs.value": "Valor por defecto",
		addOption: "Añadir opción",
		allFieldsRemoved: "Todos los campos fueron eliminados.",
		allowSelect: "Permitir seleccionar",
		and: "y",
		attribute: "Atributo",
		attributeNotPermitted: "El atributo \"{attribute}\" no está permitido, elija otro.",
		attributes: "Atributos",
		"attrs.class": "Clase",
		"attrs.className": "Clase",
		"attrs.dir": "Dirección",
		"attrs.id": "Carné de identidad",
		"attrs.required": "Necesario",
		"attrs.style": "Estilo",
		"attrs.title": "Título",
		"attrs.type": "Tipo",
		"attrs.value": "Valor",
		autocomplete: "Autocompletar",
		button: "Botón",
		cancel: "Cancelar",
		cannotBeEmpty: "Este campo no puede estar vacío",
		cannotClearFields: "No hay campos para borrar",
		checkbox: "Caja",
		checkboxes: "Casillas de verificación",
		class: "Clase",
		clear: "Claro",
		clearAllMessage: "¿Estás seguro de que quieres borrar todos los campos?",
		close: "Cerrar",
		column: "Columna",
		"condition.target.placeholder": "objetivo",
		"condition.type.and": "Y",
		"condition.type.if": "Si",
		"condition.type.or": "O",
		"condition.type.then": "Entonces",
		"condition.value.placeholder": "valor",
		confirmClearAll: "¿Estás seguro de que quieres eliminar todos los campos?",
		content: "Contenido",
		control: "Controlar",
		"controlGroups.nextGroup": "Siguiente grupo",
		"controlGroups.prevGroup": "Grupo anterior",
		"controls.filteringTerm": "Filtrado \"{term}\"",
		"controls.form.button": "Botón",
		"controls.form.checkbox-group": "Grupo de casilla de verificación",
		"controls.form.input.date": "Fecha",
		"controls.form.input.email": "Email",
		"controls.form.input.file": "Subir archivo",
		"controls.form.input.hidden": "Entrada oculta",
		"controls.form.input.number": "Número",
		"controls.form.input.text": "Entrada de texto",
		"controls.form.radio-group": "Grupo de radio",
		"controls.form.select": "Seleccionar",
		"controls.form.textarea": "TextArea",
		"controls.groups.form": "Campos de formulario",
		"controls.groups.html": "Elementos HTML",
		"controls.groups.layout": "Diseño",
		"controls.html.divider": "Divisor",
		"controls.html.header": "Encabezamiento",
		"controls.html.paragraph": "Párrafo",
		"controls.layout.column": "Columna",
		"controls.layout.row": "Fila",
		copy: "Copiar al portapapeles",
		danger: "Peligro",
		defineColumnLayout: "Definir un diseño de columna.",
		defineColumnWidths: "Definir anchos de columna",
		description: "texto de ayuda",
		descriptionField: "Descripción",
		"editing.row": "Fila de edición",
		editorTitle: "Elementos de formulario",
		field: "Campo",
		"field.property.invalid": "no es válido",
		"field.property.isChecked": "está marcado",
		"field.property.isNotVisible": "no es visible",
		"field.property.isVisible": "es visible",
		"field.property.label": "etiqueta",
		"field.property.valid": "válido",
		"field.property.value": "valor",
		fieldNonEditable: "Este campo no puede ser editado.",
		fieldRemoveWarning: "¿Estás seguro de que quieres eliminar este campo?",
		fileUpload: "Subir archivo",
		formUpdated: "Formulario actualizado",
		getStarted: "Arrastra un campo desde la derecha para empezar.",
		group: "Grupo",
		grouped: "Agrupados",
		hidden: "Entrada oculta",
		hide: "Editar",
		htmlElements: "Elementos HTML",
		if: "Si",
		"if.condition.source.placeholder": "fuente",
		"if.condition.target.placeholder": "valor objetivo",
		info: "Información",
		"input.date": "Fecha",
		"input.text": "Texto",
		label: "Etiqueta",
		labelCount: "{label} {count}",
		labelEmpty: "La etiqueta de campo no puede estar vacía",
		"lang.af": "africano",
		"lang.ar": "árabe",
		"lang.cs": "checo",
		"lang.de": "Alemán",
		"lang.en": "Inglés",
		"lang.es": "Español",
		"lang.fa": "persa",
		"lang.fi": "finlandés",
		"lang.fr": "Francés",
		"lang.he": "hebreo",
		"lang.hi": "hindi",
		"lang.hu": "húngaro",
		"lang.it": "italiano",
		"lang.ja": "japonés",
		"lang.nb": "Bokmål noruego",
		"lang.pl": "Polaco",
		"lang.pt": "portugués",
		"lang.ro": "rumano",
		"lang.ru": "ruso",
		"lang.th": "tailandés",
		"lang.tr": "turco",
		"lang.zh": "Chino",
		layout: "Diseño",
		limitRole: "Limite el acceso a uno o más de los siguientes roles:",
		mandatory: "Obligatorio",
		maxlength: "Longitud máxima",
		"meta.group": "Grupo",
		"meta.icon": "Ico",
		"meta.label": "Etiqueta",
		minOptionMessage: "Este campo requiere un mínimo de 2 opciones.",
		name: "Nombre",
		newOptionLabel: "Nuevo tipo}",
		no: "No",
		number: "Número",
		off: "Apagado",
		on: "En",
		"operator.contains": "contiene",
		"operator.equals": "es igual a",
		"operator.notContains": "no contiene",
		"operator.notEquals": "no es igual",
		"operator.notVisible": "no visible",
		"operator.visible": "visible",
		option: "Opción",
		optional: "Opcional",
		optionEmpty: "Valor de opción requerido",
		optionLabel: "Opción {cuenta}",
		options: "Opciones",
		or: "o",
		order: "Orden",
		"panel.label.attrs": "Atributos",
		"panel.label.conditions": "Condiciones",
		"panel.label.config": "Configuración",
		"panel.label.meta": "Meta",
		"panel.label.options": "Opciones",
		"panelEditButtons.attrs": "+ Atributo",
		"panelEditButtons.conditions": "+ Condición",
		"panelEditButtons.config": "+ Configuración",
		"panelEditButtons.options": "+ Opción",
		placeholder: "Marcador de posición",
		"placeholder.className": "clases separadas por espacios",
		"placeholder.email": "Ingrese su correo electrónico",
		"placeholder.label": "Etiqueta",
		"placeholder.password": "Ingresa tu contraseña",
		"placeholder.placeholder": "Marcador de posición",
		"placeholder.text": "Introduce algún texto",
		"placeholder.textarea": "Introduce mucho texto",
		"placeholder.value": "Valor",
		preview: "Avance",
		primary: "Primario",
		remove: "retirar",
		removeMessage: "Eliminar Elemento",
		removeType: "Eliminar {tipo}",
		required: "Necesario",
		reset: "Reiniciar",
		richText: "Editor de texto enriquecido",
		roles: "Acceso",
		row: "Fila",
		"row.makeInputGroup": "Haz de esta fila un grupo de entrada.",
		"row.makeInputGroupDesc": "Los grupos de entrada permiten a los usuarios agregar conjuntos de entradas a la vez.",
		"row.settings.fieldsetWrap": "Ajustar fila en un & lt; fieldset & gt; etiqueta",
		"row.settings.fieldsetWrap.aria": "Envuelva la fila en Fieldset",
		save: "Salvar",
		secondary: "Secundario",
		select: "Seleccionar",
		selectColor: "Seleccionar el color",
		selectionsMessage: "Permitir selecciones múltiples",
		selectOptions: "Opciones",
		separator: "Separador",
		settings: "Ajustes",
		size: "tamaño",
		sizes: "Tamaños",
		"sizes.lg": "Grande",
		"sizes.m": "Defecto",
		"sizes.sm": "Pequeña",
		"sizes.xs": "Extra Pequeño",
		style: "Estilo",
		styles: "Estilos",
		"styles.btn": "Estilo de botón",
		"styles.btn.danger": "Peligro",
		"styles.btn.default": "Defecto",
		"styles.btn.info": "Información",
		"styles.btn.primary": "Primario",
		"styles.btn.success": "Éxito",
		"styles.btn.warning": "Advertencia",
		subtype: "Tipo",
		success: "Éxito",
		text: "Campo de texto",
		then: "Entonces",
		"then.condition.target.placeholder": "objetivo",
		toggle: "Palanca",
		ungrouped: "A-Agrupados",
		warning: "Advertencia",
		yes: "Sí"
	},
	"fa-IR": {
		"fa-IR": "فارسی (ایران)",
		dir: "rtl",
		"en-US": "Farsi",
		"af-ZA": "آفریکانس (افریقای جنوبی)",
		"ar-TN": "عربی (تونس)",
		"cs-CZ": "چکی (چک)",
		"de-DE": "آلمانی (آلمان)",
		"es-ES": "اسپانیایی اروپا",
		"fi-FI": "فنلاندی (فنلاند)",
		"fr-FR": "فرانسوی (فرانسه)",
		"he-IL": "عبری (اسرائیل)",
		"hi-IN": "هندی (هند)",
		"hu-HU": "مجاری (مجارستان)",
		"it-IT": "ایتالیایی (ایتالیا)",
		"ja-JP": "ژاپنی (ژاپن)",
		"nb-NO": "نروژی بوک‌مُل (نروژ)",
		"pl-PL": "لهستانی (لهستان)",
		"pt-BR": "پرتغالی برزیل",
		"pt-PT": "پرتغالی اروپا",
		"ro-RO": "رومانیایی (رومانی)",
		"ru-RU": "روسی (روسیه)",
		"th-TH": "تایلندی (تایلند)",
		"tr-TR": "ترکی استانبولی (ترکیه)",
		"zh-CN": "چینی (چین)",
		"zh-HK": "چینی (هنگ‌کنگ، منطقهٔ ویژهٔ اداری چین)",
		"action.add.attrs.attr": "چه ویژگی را می خواهید اضافه کنید؟",
		"action.add.attrs.value": "مقدار پیش فرض",
		addOption: "افزودن گزینه",
		allFieldsRemoved: "تمام فیلدها حذف شدند.",
		allowSelect: "اجازه انتخاب",
		and: "وارد",
		attribute: "ویژگی",
		attributeNotPermitted: "ویژگی \"{attribute}\" مجاز نیست, لطفا دیگری را انتخاب کنید.",
		attributes: "ویژگی ها",
		"attrs.class": "کلاس",
		"attrs.className": "کلاس",
		"attrs.dir": "جهت",
		"attrs.id": "آی دی",
		"attrs.required": "اجباری",
		"attrs.style": "استایل",
		"attrs.title": "عنوان",
		"attrs.type": "نوع",
		"attrs.value": "مقدار",
		autocomplete: "تکمیل خودکار",
		button: "دکمه",
		cancel: "لغو",
		cannotBeEmpty: "این فیلد نمی تواند خالی باشد",
		cannotClearFields: "هیچ فیلدی برای پاک کردن وجود ندارد",
		checkbox: "چک باکس",
		checkboxes: "چک باکس ها",
		class: "کلاس",
		clear: "پاک کردن",
		clearAllMessage: "آیا مطمئن هستید که می خواهید همه فیلدها را پاک کنید؟",
		close: "بستن",
		column: "ستون",
		"condition.target.placeholder": "هدف",
		"condition.type.and": "و",
		"condition.type.if": "اگر",
		"condition.type.or": "یا",
		"condition.type.then": "سپس",
		"condition.value.placeholder": "مقدار",
		confirmClearAll: "آیا مطمئن هستید که می خواهید همه فیلدها را حذف کنید؟",
		content: "محتوا",
		control: "کنترل",
		"controlGroups.nextGroup": "گروه بعدی",
		"controlGroups.prevGroup": "گروه قبلی",
		"controls.filteringTerm": "فیلتر کردن \"{term}\"",
		"controls.form.button": "دکمه",
		"controls.form.checkbox-group": "گروه چک باکس",
		"controls.form.input.date": "تاریخ",
		"controls.form.input.email": "ایمیل",
		"controls.form.input.file": "آپلود فایل",
		"controls.form.input.hidden": "فیلد پنهان",
		"controls.form.input.number": "عدد",
		"controls.form.input.text": "ورودی متن",
		"controls.form.radio-group": "گروه رادیوها",
		"controls.form.select": "انتخاب",
		"controls.form.textarea": "باکس متن",
		"controls.groups.form": "فیلدهای فرم",
		"controls.groups.html": "عناصر HTML",
		"controls.groups.layout": "چیدمان",
		"controls.html.divider": "تقسیم کننده",
		"controls.html.header": "سرتیتر",
		"controls.html.paragraph": "پاراگراف",
		"controls.layout.column": "ستون",
		"controls.layout.row": "ردیف",
		copy: "کپی در کلیپ بورد",
		danger: "خطر",
		defineColumnLayout: "طرح بندی ستون را تعریف کنید",
		defineColumnWidths: "عرض ستون را تعریف کنید",
		description: "متن راهنما",
		descriptionField: "شرح",
		"editing.row": "ویرایش ردیف",
		editorTitle: "عناصر فرم",
		field: "فیلد",
		"field.property.invalid": "نادرست",
		"field.property.isChecked": "بررسی می شود",
		"field.property.isNotVisible": "صحیح نیست",
		"field.property.isVisible": "صحیح است",
		"field.property.label": "برچسب",
		"field.property.valid": "صحیح",
		"field.property.value": "مقدار",
		fieldNonEditable: "این فیلد قابل ویرایش نیست.",
		fieldRemoveWarning: "آیا مطمئن هستید که می خواهید این فیلد را حذف کنید؟",
		fileUpload: "آپلود فایل",
		formUpdated: "فرم به روز شد",
		getStarted: "برای شروع یک فیلد را از سمت راست بکشید.",
		group: "گروه",
		grouped: "گروه بندی شده",
		hidden: "فیلد پنهان",
		hide: "ویرایش",
		htmlElements: "HTML عناصر",
		if: "اگر",
		"if.condition.source.placeholder": "منبع",
		"if.condition.target.placeholder": "هدف / ارزش",
		info: "اطلاعات",
		"input.date": "تاریخ",
		"input.text": "متن",
		label: "برچسب",
		labelCount: "{label} {count}",
		labelEmpty: "برچسب فیلد نمی تواند خالی باشد",
		"lang.af": "آفریقایی",
		"lang.ar": "عربی",
		"lang.cs": "چک",
		"lang.de": "آلمانی",
		"lang.en": "انگلیسی",
		"lang.es": "اسپانیایی",
		"lang.fa": "فارسی",
		"lang.fi": "فنلاندی",
		"lang.fr": "فرانسوی",
		"lang.he": "عبری",
		"lang.hi": "هندی",
		"lang.hu": "مجارستانی",
		"lang.it": "ایتالیایی",
		"lang.ja": "ژاپنی",
		"lang.nb": "نروژی بوکمال",
		"lang.pl": "لهستانی",
		"lang.pt": "پرتغالی",
		"lang.ro": "رومانیایی",
		"lang.ru": "روسی",
		"lang.th": "تایلندی",
		"lang.tr": "ترکی",
		"lang.zh": "چینی",
		layout: "چیدمان",
		limitRole: "دسترسی به یک یا چند نقش زیر را محدود کنید:",
		mandatory: "اجباری",
		maxlength: "حداکثر طول",
		"meta.group": "گروه",
		"meta.icon": "ایکون",
		"meta.label": "برچسب",
		minOptionMessage: "این فیلد به حداقل 2 گزینه نیاز دارد",
		name: "نام",
		newOptionLabel: "جدید {type}",
		no: "خیر",
		number: "عدد",
		off: "خاموش",
		on: "روشن",
		"operator.contains": "شامل",
		"operator.equals": "برابر",
		"operator.notContains": "شامل نمی شود",
		"operator.notEquals": "نا برابر",
		"operator.notVisible": "غیر قابل رویت",
		"operator.visible": "قابل رویت",
		option: "گزینه",
		optional: "اختیاری",
		optionEmpty: "مقدار گزینه مورد نیاز است",
		optionLabel: "گزینه {count}",
		options: "گزینه ها",
		or: "یا",
		order: "سفارش",
		"panel.label.attrs": "ویژگی ها",
		"panel.label.conditions": "شروط",
		"panel.label.config": "پیکربندی",
		"panel.label.meta": "متا",
		"panel.label.options": "گزینه ها",
		"panelEditButtons.attrs": "+ ویژگی",
		"panelEditButtons.conditions": "+ شرط",
		"panelEditButtons.config": "+ پیکربندی",
		"panelEditButtons.options": "+ گزینه",
		placeholder: "متن پیش فرض فیلد",
		"placeholder.className": "فضای جدا دشه کلاس ها",
		"placeholder.email": "ایمیل خود را وارد کنید",
		"placeholder.label": "برچسب",
		"placeholder.password": "رمز عبور خود را وارد کنید",
		"placeholder.placeholder": "متن پیش فرض فیلد",
		"placeholder.text": "مقداری متن وارد کنید",
		"placeholder.textarea": "مقدار زیادی متن وارد کنید",
		"placeholder.value": "مقدار",
		preview: "پیش نمایش",
		primary: "اولیه",
		remove: "حذف",
		removeMessage: "حذف عنصر",
		removeType: "حذف {type}",
		required: "اجباری",
		reset: "بازنشانی",
		richText: "ویرایشگر متن توانمند",
		roles: "دسترسی",
		row: "ردیف",
		"row.makeInputGroup": "این ردیف را به یک گروه ورودی تبدیل کنید.",
		"row.makeInputGroupDesc": "گروه ورودی به کاربران امکان می‌دهد تا مجموعه‌هایی از ورودی‌ها را در یک زمان اضافه کنند.",
		"row.settings.fieldsetWrap": "یک ردیف را جدا کنید در &lt;fieldset&gt; tag",
		"row.settings.fieldsetWrap.aria": "ردیف را در فیلد بالا جدا کنید",
		save: "ذخیره",
		secondary: "ثانوی",
		select: "انتخاب",
		selectColor: "انتخاب رنگ",
		selectionsMessage: "اجازه انتخاب های متعدد",
		selectOptions: "گزینه ها",
		separator: "جداکننده",
		settings: "تنظیمات",
		size: "اندازه",
		sizes: "اندازه ها",
		"sizes.lg": "بزرگ",
		"sizes.m": "پیش فرض",
		"sizes.sm": "کوچک",
		"sizes.xs": "بسیار کوچک",
		style: "استایل ها",
		styles: "استایل ها",
		"styles.btn": "استایل دکمه",
		"styles.btn.danger": "خطر",
		"styles.btn.default": "پیش فرض",
		"styles.btn.info": "اطلاعات",
		"styles.btn.primary": "اولیه",
		"styles.btn.success": "موفقیت",
		"styles.btn.warning": "هشدار",
		subtype: "نوع",
		success: "موفقیت",
		text: "فیلد متن",
		then: "سپس",
		"then.condition.target.placeholder": "هدف",
		toggle: "تغییر وضعیت",
		ungrouped: "گروه بندی نشده",
		warning: "هشدار",
		yes: "بله"
	},
	"fi-FI": {
		"fi-FI": "suomi (Suomi)",
		dir: "ltr",
		"en-US": "englanti",
		"af-ZA": "afrikaans (Etelä-Afrikka)",
		"ar-TN": "arabia (Tunisia)",
		"cs-CZ": "tšekki (Tšekki)",
		"de-DE": "saksa (Saksa)",
		"es-ES": "euroopanespanja",
		"fa-IR": "persia (Iran)",
		"fr-FR": "ranska (Ranska)",
		"he-IL": "heprea (Israel)",
		"hi-IN": "hindi (Intia)",
		"hu-HU": "unkari (Unkari)",
		"it-IT": "italia (Italia)",
		"ja-JP": "japani (Japani)",
		"nb-NO": "norjan bokmål (Norja)",
		"pl-PL": "puola (Puola)",
		"pt-BR": "brasilianportugali",
		"pt-PT": "euroopanportugali",
		"ro-RO": "romania (Romania)",
		"ru-RU": "venäjä (Venäjä)",
		"th-TH": "thai (Thaimaa)",
		"tr-TR": "turkki (Turkki)",
		"zh-CN": "kiina (Kiina)",
		"zh-HK": "kiina (Hongkong – Kiinan erityishallintoalue)",
		"action.add.attrs.attr": "Minkä ominaisuuden haluaisit lisätä?",
		"action.add.attrs.value": "Oletusarvo",
		addOption: "Lisää vaihtoehto",
		allFieldsRemoved: "Kaikki kentät poistettiin.",
		allowSelect: "Salli Valitse",
		and: "ja",
		attribute: "Attribuutti",
		attributeNotPermitted: "Attribuutti \"{attribute}\" ei ole sallittu, valitse toinen.",
		attributes: "Attribuutit",
		"attrs.class": "Luokka",
		"attrs.className": "Luokka",
		"attrs.dir": "Suunta",
		"attrs.id": "Id",
		"attrs.required": "Pakollinen",
		"attrs.style": "Tyyli",
		"attrs.title": "Otsikko",
		"attrs.type": "Tyyppi",
		"attrs.value": "Arvo",
		autocomplete: "Automaattinen täydennys",
		button: "Painike",
		cancel: "Peruuttaa",
		cannotBeEmpty: "Tämä kenttä ei voi olla tyhjä",
		cannotClearFields: "Ei ole tyhjennettyjä kenttiä",
		checkbox: "Valintaruutu",
		checkboxes: "valintaruudut",
		class: "Luokka",
		clear: "Selkeä",
		clearAllMessage: "Haluatko varmasti tyhjentää kaikki kentät?",
		close: "Lähellä",
		column: "Sarake",
		"condition.target.placeholder": "tavoite",
		"condition.type.and": "Ja",
		"condition.type.if": "Jos",
		"condition.type.or": "Tai",
		"condition.type.then": "Sitten",
		"condition.value.placeholder": "arvo",
		confirmClearAll: "Haluatko varmasti poistaa kaikki kentät?",
		content: "Sisältö",
		control: "Ohjaus",
		"controlGroups.nextGroup": "Seuraava ryhmä",
		"controlGroups.prevGroup": "Edellinen ryhmä",
		"controls.filteringTerm": "Suodatetaan \"{term}\"",
		"controls.form.button": "Painike",
		"controls.form.checkbox-group": "Valintaruuturyhmä",
		"controls.form.input.date": "Päivämäärä",
		"controls.form.input.email": "Sähköposti",
		"controls.form.input.file": "Tiedoston lataus",
		"controls.form.input.hidden": "Piilotettu syöttö",
		"controls.form.input.number": "Määrä",
		"controls.form.input.text": "Tekstinsyöttö",
		"controls.form.radio-group": "Radioryhmä",
		"controls.form.select": "Valitse",
		"controls.form.textarea": "Tekstialue",
		"controls.groups.form": "Lomakekentät",
		"controls.groups.html": "HTML-elementit",
		"controls.groups.layout": "Layout",
		"controls.html.divider": "Jakaja",
		"controls.html.header": "Otsikko",
		"controls.html.paragraph": "Kohta",
		"controls.layout.column": "Sarake",
		"controls.layout.row": "Rivi",
		copy: "Kopioi leikepöydälle",
		danger: "Vaara",
		defineColumnLayout: "Määritä sarakkeen asettelu",
		defineColumnWidths: "Määritä sarakkeiden leveydet",
		description: "Ohjeteksti",
		descriptionField: "Kuvaus",
		"editing.row": "Muokkaa riviä",
		editorTitle: "Lomakkeen elementit",
		field: "Ala",
		"field.property.invalid": "ei kelpaa",
		"field.property.isChecked": "on tarkistettu",
		"field.property.isNotVisible": "ei ole näkyvissä",
		"field.property.isVisible": "on näkyvissä",
		"field.property.label": "etiketti",
		"field.property.valid": "voimassa",
		"field.property.value": "arvo",
		fieldNonEditable: "Tätä kenttää ei voi muokata.",
		fieldRemoveWarning: "Haluatko varmasti poistaa tämän kentän?",
		fileUpload: "Tiedoston lataus",
		formUpdated: "Lomake päivitetty",
		getStarted: "Aloita vetämällä kenttää oikealta.",
		group: "ryhmä",
		grouped: "Ryhmitetty",
		hidden: "Piilotettu syöttö",
		hide: "Muokata",
		htmlElements: "HTML-elementit",
		if: "Jos",
		"if.condition.source.placeholder": "lähde",
		"if.condition.target.placeholder": "tavoite / arvo",
		info: "Tiedot",
		"input.date": "Päivämäärä",
		"input.text": "Teksti",
		label: "Label",
		labelCount: "{label} {count}",
		labelEmpty: "Kentän tunniste ei voi olla tyhjä",
		"lang.af": "afrikkalainen",
		"lang.ar": "arabia",
		"lang.cs": "Tšekki",
		"lang.de": "saksaksi",
		"lang.en": "englanti",
		"lang.es": "espanja",
		"lang.fa": "persialainen",
		"lang.fi": "suomalainen",
		"lang.fr": "ranskalainen",
		"lang.he": "heprea",
		"lang.hi": "hindi",
		"lang.hu": "Unkari",
		"lang.it": "italialainen",
		"lang.ja": "japanilainen",
		"lang.nb": "norjalainen bokmål",
		"lang.pl": "Kiillottaa",
		"lang.pt": "portugali",
		"lang.ro": "romanialainen",
		"lang.ru": "venäjäksi",
		"lang.th": "thaimaalainen",
		"lang.tr": "turkkilainen",
		"lang.zh": "kiinalainen",
		layout: "Layout",
		limitRole: "Rajoita pääsyä yhteen tai useampaan seuraavista rooleista:",
		mandatory: "Pakollinen",
		maxlength: "Max pituus",
		"meta.group": "ryhmä",
		"meta.icon": "Ico",
		"meta.label": "Label",
		minOptionMessage: "Tämä kenttä vaatii vähintään 2 vaihtoehtoa",
		name: "Nimi",
		newOptionLabel: "Uusi {type}",
		no: "Ei",
		number: "Määrä",
		off: "Pois",
		on: "Päällä",
		"operator.contains": "sisältää",
		"operator.equals": "on yhtä suuri",
		"operator.notContains": "ei sisällä",
		"operator.notEquals": "ei tasa-arvoinen",
		"operator.notVisible": "ei näy",
		"operator.visible": "näkyvissä",
		option: "Vaihtoehto",
		optional: "valinnainen",
		optionEmpty: "Vaihtoehdon arvo vaaditaan",
		optionLabel: "Vaihtoehto {count}",
		options: "Vaihtoehdot",
		or: "tai",
		order: "Tilata",
		"panel.label.attrs": "Attribuutit",
		"panel.label.conditions": "ehdot",
		"panel.label.config": "Kokoonpano",
		"panel.label.meta": "Meta",
		"panel.label.options": "Vaihtoehdot",
		"panelEditButtons.attrs": "+ Attribuutti",
		"panelEditButtons.conditions": "+ Kunto",
		"panelEditButtons.config": "+ Kokoonpano",
		"panelEditButtons.options": "+ Vaihtoehto",
		placeholder: "Paikkamerkki",
		"placeholder.className": "tilaa erotetut luokat",
		"placeholder.email": "Kirjoita sähköpostiosoitteesi",
		"placeholder.label": "Label",
		"placeholder.password": "Kirjoita salasanasi",
		"placeholder.placeholder": "Paikkamerkki",
		"placeholder.text": "Kirjoita tekstiä",
		"placeholder.textarea": "Kirjoita paljon tekstiä",
		"placeholder.value": "Arvo",
		preview: "Esikatselu",
		primary: "Ensisijainen",
		remove: "Poistaa",
		removeMessage: "Poista elementti",
		removeType: "Poista {type}",
		required: "Pakollinen",
		reset: "Nollaa",
		richText: "Rich Text Editor",
		roles: "Pääsy",
		row: "Rivi",
		"row.makeInputGroup": "Tee tästä rivistä syöttöryhmä.",
		"row.makeInputGroupDesc": "Syöttöryhmien avulla käyttäjät voivat lisätä syötteitä kerrallaan.",
		"row.settings.fieldsetWrap": "Rivitä rivi &lt;fieldset&gt; tag",
		"row.settings.fieldsetWrap.aria": "Rivitä rivi Fieldsetissä",
		save: "Tallentaa",
		secondary: "Toissijainen",
		select: "Valitse",
		selectColor: "Valitse Väri",
		selectionsMessage: "Salli useita valintoja",
		selectOptions: "Vaihtoehdot",
		separator: "Erotin",
		settings: "Asetukset",
		size: "Koko",
		sizes: "Koot",
		"sizes.lg": "Suuri",
		"sizes.m": "Oletus",
		"sizes.sm": "Pieni",
		"sizes.xs": "Erittäin pieni",
		style: "Tyyli",
		styles: "Tyylit",
		"styles.btn": "Painikkeen tyyli",
		"styles.btn.danger": "Vaara",
		"styles.btn.default": "Oletus",
		"styles.btn.info": "Tiedot",
		"styles.btn.primary": "Ensisijainen",
		"styles.btn.success": "Menestys",
		"styles.btn.warning": "Varoitus",
		subtype: "Tyyppi",
		success: "Menestys",
		text: "Tekstikenttä",
		then: "Sitten",
		"then.condition.target.placeholder": "tavoite",
		toggle: "Vaihda",
		ungrouped: "Ryhmittelemätön",
		warning: "Varoitus",
		yes: "Kyllä"
	},
	"fr-FR": {
		"fr-FR": "français (France)",
		dir: "ltr",
		"en-US": "Anglais",
		"af-ZA": "afrikaans (Afrique du Sud)",
		"ar-TN": "arabe (Tunisie)",
		"cs-CZ": "tchèque (Tchéquie)",
		"de-DE": "allemand (Allemagne)",
		"es-ES": "espagnol d’Espagne",
		"fa-IR": "persan (Iran)",
		"fi-FI": "finnois (Finlande)",
		"he-IL": "hébreu (Israël)",
		"hi-IN": "hindi (Inde)",
		"hu-HU": "hongrois (Hongrie)",
		"it-IT": "italien (Italie)",
		"ja-JP": "japonais (Japon)",
		"nb-NO": "norvégien bokmål (Norvège)",
		"pl-PL": "polonais (Pologne)",
		"pt-BR": "portugais brésilien",
		"pt-PT": "portugais européen",
		"ro-RO": "roumain (Roumanie)",
		"ru-RU": "russe (Russie)",
		"th-TH": "thaï (Thaïlande)",
		"tr-TR": "turc (Turquie)",
		"zh-CN": "chinois (Chine)",
		"zh-HK": "chinois (R.A.S. chinoise de Hong Kong)",
		"action.add.attrs.attr": "Quel attribut souhaitez-vous ajouter?",
		"action.add.attrs.value": "Valeur par défaut",
		addOption: "Ajouter option",
		allFieldsRemoved: "Tout les champs ont étés supprimés.",
		allowSelect: "Permettre la sélection",
		and: "et",
		attribute: "Attribut",
		attributeNotPermitted: "Attribut  «{attribute}» non permis, veuillez en choisir un autre.",
		attributes: "Attributs",
		"attrs.class": "Classe",
		"attrs.className": "Classe",
		"attrs.dir": "Direction",
		"attrs.id": "Id",
		"attrs.required": "Requis",
		"attrs.style": "Style",
		"attrs.title": "Titre",
		"attrs.type": "Type",
		"attrs.value": "Valeur",
		autocomplete: "Auto-complétion",
		button: "Bouton",
		cancel: "Annuler",
		cannotBeEmpty: "Ce champ ne peut être vide",
		cannotClearFields: "Il n'y a pas de champ à vider",
		checkbox: "Case à cocher",
		checkboxes: "Cases à cocher",
		class: "Classe",
		clear: "Supprimer",
		clearAllMessage: "Êtes-vous certain de vouloir tout supprimer?",
		close: "Fermer",
		column: "Colonne",
		"condition.target.placeholder": "destination",
		"condition.type.and": "Et",
		"condition.type.if": "Si",
		"condition.type.or": "Ou",
		"condition.type.then": "Alors",
		"condition.value.placeholder": "valeur condition",
		confirmClearAll: "Êtes-vous certain de vouloir supprimer tous les champs?",
		content: "Contenu",
		control: "Contrôle",
		"controlGroups.nextGroup": "Prochain groupe",
		"controlGroups.prevGroup": "Groupe précédent",
		"controls.filteringTerm": "Triage «{term}»",
		"controls.form.button": "Bouton",
		"controls.form.checkbox-group": "Groupe de cases à cocher",
		"controls.form.input.date": "Date",
		"controls.form.input.email": "Courriel",
		"controls.form.input.file": "Téléversement de fichier",
		"controls.form.input.hidden": "Champ caché",
		"controls.form.input.number": "Numéro",
		"controls.form.input.text": "Champ de texte",
		"controls.form.radio-group": "Groupe de boutons radio",
		"controls.form.select": "Sélection",
		"controls.form.textarea": "Zone de texte",
		"controls.groups.form": "Champs de formulaire",
		"controls.groups.html": "Éléments HTML",
		"controls.groups.layout": "Disposition",
		"controls.html.divider": "Séparateur",
		"controls.html.header": "Entête",
		"controls.html.paragraph": "Paragraphe",
		"controls.layout.column": "Colonne",
		"controls.layout.row": "Rang",
		copy: "Copier au presse-papier",
		danger: "Danger",
		defineColumnLayout: "Définir une disposition de colonnes",
		defineColumnWidths: "Définir la largeur des colonnes",
		description: "Texte d'aide",
		descriptionField: "Description",
		"editing.row": "Édition de rang",
		editorTitle: "Éléments de formulaire",
		field: "Champ",
		"field.property.invalid": "invalide",
		"field.property.isChecked": "est vérifié",
		"field.property.isNotVisible": "non-visible",
		"field.property.isVisible": "visible",
		"field.property.label": "Étiquette",
		"field.property.valid": "valide",
		"field.property.value": "Valeur",
		fieldNonEditable: "Ce champ ne peut être modifié.",
		fieldRemoveWarning: "Êtes-vous sûr de vouloir supprimer ce champ?",
		fileUpload: "Téléversement de fichier",
		formUpdated: "Formulaire mis-à-jour",
		getStarted: "Déplacer un champ de la droite pour commencer.",
		group: "Groupe",
		grouped: "Groupés",
		hidden: "Champ caché",
		hide: "Modifier",
		htmlElements: "Élements HTML",
		if: "Si",
		"if.condition.source.placeholder": "si vrai source",
		"if.condition.target.placeholder": "si vrai destination",
		info: "Info",
		"input.date": "Date",
		"input.text": "Texte",
		label: "Étiquette",
		labelCount: "{label} {count}",
		labelEmpty: "L'Étiquette du champ ne peut être vide",
		"lang.af": "africain",
		"lang.ar": "arabe",
		"lang.cs": "tchèque",
		"lang.de": "Allemand",
		"lang.en": "Anglais",
		"lang.es": "Espagnol",
		"lang.fa": "persan",
		"lang.fi": "finlandais",
		"lang.fr": "Français",
		"lang.he": "hébreu",
		"lang.hi": "hindi",
		"lang.hu": "hongrois",
		"lang.it": "italien",
		"lang.ja": "japonais",
		"lang.nb": "bokmål norvégien",
		"lang.pl": "polonais",
		"lang.pt": "portugais",
		"lang.ro": "roumain",
		"lang.ru": "russe",
		"lang.th": "thaïlandais",
		"lang.tr": "turc",
		"lang.zh": "Chinois",
		layout: "Disposition",
		limitRole: "Limiter l'acces à un des rôles suivants :",
		mandatory: "Obligatoire",
		maxlength: "Longueur maximum",
		"meta.group": "Groupe",
		"meta.icon": "Vignette",
		"meta.label": "Étiquette",
		minOptionMessage: "Ce champ requiert un minimum de deux options",
		name: "Nom",
		newOptionLabel: "Nouveau {type}",
		no: "Non",
		number: "Numéro",
		off: "Désactivé",
		on: "Activé",
		"operator.contains": "contient",
		"operator.equals": "égaux",
		"operator.notContains": "ne contient pas",
		"operator.notEquals": "ne sont pas égaux",
		"operator.notVisible": "non-visible",
		"operator.visible": "visible",
		option: "Option",
		optional: "optionel",
		optionEmpty: "Valeur de l'option requise",
		optionLabel: "Option {count}",
		options: "Options",
		or: "ou",
		order: "Organiser",
		"panel.label.attrs": "Attributs",
		"panel.label.conditions": "Conditions",
		"panel.label.config": "Configuration",
		"panel.label.meta": "Meta",
		"panel.label.options": "Options",
		"panelEditButtons.attrs": "+ Attribut",
		"panelEditButtons.conditions": "+ Condition",
		"panelEditButtons.config": "+ Configuration",
		"panelEditButtons.options": "+ Option",
		placeholder: "Texte Fictif",
		"placeholder.className": "classes séparées par espaces",
		"placeholder.email": "Entrez votre courriel",
		"placeholder.label": "Étiquette",
		"placeholder.password": "Entrez votre mot de passe",
		"placeholder.placeholder": "Texte Fictif",
		"placeholder.text": "Entrez du texte",
		"placeholder.textarea": "Entrez beaucoup de texte",
		"placeholder.value": "Valeur",
		preview: "Aperçu",
		primary: "Primaire",
		remove: "Supprimer",
		removeMessage: "Supprimer l'élément",
		removeType: "Supprimer {type}",
		required: "Requis",
		reset: "Réinitialiser",
		richText: "Éditeur de texte enrichi",
		roles: "Acces",
		row: "Ligne",
		"row.makeInputGroup": "Définir cette ligne comme groupe de saisie.",
		"row.makeInputGroupDesc": "Les groupes de saisie permettent aux usagers de rajouter de multiples champs à la fois.",
		"row.settings.fieldsetWrap": "Entourer le champ d'un élément &lt;fieldset&gt;",
		"row.settings.fieldsetWrap.aria": `Entourer le champ d'un "Fieldset"`,
		save: "Sauvegarder",
		secondary: "Secondaire",
		select: "Sélection",
		selectColor: "Selectionner une couleur",
		selectionsMessage: "Permettre une sélection multiple",
		selectOptions: "Options",
		separator: "Séparateur",
		settings: "Paramètres de configuration",
		size: "Grandeur",
		sizes: "Grandeurs",
		"sizes.lg": "Grand",
		"sizes.m": "Grandeur par défaut",
		"sizes.sm": "Petit",
		"sizes.xs": "Extrèmement petit",
		style: "Motif",
		styles: "Motifs",
		"styles.btn": "Motifs de bouton",
		"styles.btn.danger": "Danger",
		"styles.btn.default": "Motif par défaut de bouton",
		"styles.btn.info": "Info",
		"styles.btn.primary": "Primaire",
		"styles.btn.success": "Success",
		"styles.btn.warning": "Avertissement",
		subtype: "Type",
		success: "Succès",
		text: "Champ de texte",
		then: "Ensuite",
		"then.condition.target.placeholder": "alors destination",
		toggle: "Basculer",
		ungrouped: "Non-groupé",
		warning: "Avertissement",
		yes: "Oui"
	},
	"he-IL": {
		"he-IL": "עברית (ישראל)",
		dir: "rtl",
		"en-US": "אַנגְלִית",
		"af-ZA": "אפריקנס (דרום אפריקה)",
		"ar-TN": "ערבית (תוניסיה)",
		"cs-CZ": "צ'כיה (צ'כיה)",
		"de-DE": "גרמנית (גרמניה)",
		"es-ES": "ספרדית אירופאית",
		"fa-IR": "פרסית (איראן)",
		"fi-FI": "פינית (פינלנד)",
		"fr-FR": "צרפתית (צרפת)",
		"hi-IN": "הינדי (הודו)",
		"hu-HU": "הונגרית (הונגריה)",
		"it-IT": "איטלקית (איטליה)",
		"ja-JP": "יפנית (יפן)",
		"nb-NO": "בוקמול נורבגית (נורווגיה)",
		"pl-PL": "פולנית (פולין)",
		"pt-BR": "פורטוגזית ברזילאית",
		"pt-PT": "פורטוגזית אירופאית",
		"ro-RO": "רומנית (רומניה)",
		"ru-RU": "רוסית (רוסיה)",
		"th-TH": "תאילנד (תאילנד)",
		"tr-TR": "טורקית (טורקיה)",
		"zh-CN": "סינית (סין)",
		"zh-HK": "סינית (הונג קונג SAR סין)",
		"action.add.attrs.attr": "איזו תכונה תרצה להוסיף?",
		"action.add.attrs.value": "ערך ברירת מחדל",
		addOption: "הוסף אפשרות",
		allFieldsRemoved: "כל השדות הוסרו.",
		allowSelect: "אפשר בחירה",
		and: "ו",
		attribute: "תְכוּנָה",
		attributeNotPermitted: "התכונה \"{attribute}\" אינה מותרת, אנא בחר אחר.",
		attributes: "תכונות",
		"attrs.class": "מַחלָקָה",
		"attrs.className": "מַחלָקָה",
		"attrs.dir": "כיוון",
		"attrs.id": "תְעוּדַת זֶהוּת",
		"attrs.required": "דָרוּשׁ",
		"attrs.style": "סִגְנוֹן",
		"attrs.title": "כּוֹתֶרֶת",
		"attrs.type": "סוּג",
		"attrs.value": "עֵרֶך",
		autocomplete: "השלמה אוטומטית",
		button: "לַחְצָן",
		cancel: "לְבַטֵל",
		cannotBeEmpty: "שדה זה לא יכול להיות ריק",
		cannotClearFields: "אין שדות לנקות",
		checkbox: "תיבת סימון",
		checkboxes: "תיבות סימון",
		class: "מַחלָקָה",
		clear: "בָּרוּר",
		clearAllMessage: "האם אתה בטוח שברצונך לנקות את כל השדות?",
		close: "לִסְגוֹר",
		column: "עַמוּדָה",
		"condition.target.placeholder": "יַעַד",
		"condition.type.and": "ו",
		"condition.type.if": "אִם",
		"condition.type.or": "אוֹ",
		"condition.type.then": "אָז",
		"condition.value.placeholder": "עֵרֶך",
		confirmClearAll: "האם אתה בטוח שברצונך להסיר את כל השדות?",
		content: "תוֹכֶן",
		control: "לִשְׁלוֹט",
		"controlGroups.nextGroup": "הקבוצה הבאה",
		"controlGroups.prevGroup": "הקבוצה הקודמת",
		"controls.filteringTerm": "מסנן \"{term}\"",
		"controls.form.button": "לַחְצָן",
		"controls.form.checkbox-group": "קבוצת תיבת סימון",
		"controls.form.input.date": "תַאֲרִיך",
		"controls.form.input.email": "אֶלֶקטרוֹנִי",
		"controls.form.input.file": "העלאת קובץ",
		"controls.form.input.hidden": "קלט מוסתר",
		"controls.form.input.number": "מִספָּר",
		"controls.form.input.text": "קלט טקסט",
		"controls.form.radio-group": "קבוצת רדיו",
		"controls.form.select": "לִבחוֹר",
		"controls.form.textarea": "TextArea",
		"controls.groups.form": "שדות טופס",
		"controls.groups.html": "רכיבי HTML",
		"controls.groups.layout": "מַעֲרָך",
		"controls.html.divider": "מְחַלֵק",
		"controls.html.header": "כּוֹתֶרֶת",
		"controls.html.paragraph": "סָעִיף",
		"controls.layout.column": "עַמוּדָה",
		"controls.layout.row": "שׁוּרָה",
		copy: "העתק ללוח",
		danger: "סַכָּנָה",
		defineColumnLayout: "הגדר פריסת עמודה",
		defineColumnWidths: "הגדר רוחבי עמודות",
		description: "טקסט עזרה",
		descriptionField: "תֵאוּר",
		"editing.row": "שורת עריכה",
		editorTitle: "רכיבי טופס",
		field: "שָׂדֶה",
		"field.property.invalid": "לא תקף",
		"field.property.isChecked": "נבדק",
		"field.property.isNotVisible": "אינו נראה לעין",
		"field.property.isVisible": "גלוי",
		"field.property.label": "מַדבֵּקָה",
		"field.property.valid": "תָקֵף",
		"field.property.value": "עֵרֶך",
		fieldNonEditable: "לא ניתן לערוך שדה זה.",
		fieldRemoveWarning: "האם אתה בטוח שברצונך להסיר את השדה הזה?",
		fileUpload: "העלאת קובץ",
		formUpdated: "הטופס עודכן",
		getStarted: "גרור שדה מימין כדי להתחיל.",
		group: "קְבוּצָה",
		grouped: "מקובצים",
		hidden: "קלט מוסתר",
		hide: "לַעֲרוֹך",
		htmlElements: "רכיבי HTML",
		if: "אִם",
		"if.condition.source.placeholder": "מָקוֹר",
		"if.condition.target.placeholder": "יעד / ערך",
		info: "מידע",
		"input.date": "תַאֲרִיך",
		"input.text": "טֶקסט",
		label: "מַדבֵּקָה",
		labelCount: "{label} {count}",
		labelEmpty: "תווית שדה לא יכולה להיות ריקה",
		"lang.af": "אַפְרִיקַנִי",
		"lang.ar": "עֲרָבִית",
		"lang.cs": "צ'כית",
		"lang.de": "גֶרמָנִיָת",
		"lang.en": "אַנגְלִית",
		"lang.es": "סְפָרַדִית",
		"lang.fa": "פַּרסִית",
		"lang.fi": "פִינִית",
		"lang.fr": "צָרְפָתִית",
		"lang.he": "עברית",
		"lang.hi": "הינדי",
		"lang.hu": "הוּנגָרִי",
		"lang.it": "אִיטַלְקִית",
		"lang.ja": "יַפָּנִית",
		"lang.nb": "בוקמול נורבגית",
		"lang.pl": "פּוֹלָנִית",
		"lang.pt": "פורטוגזית",
		"lang.ro": "רומנית",
		"lang.ru": "רוּסִי",
		"lang.th": "תאילנדית",
		"lang.tr": "טוּרקִית",
		"lang.zh": "סִינִית",
		layout: "מַעֲרָך",
		limitRole: "הגבל גישה לאחד או יותר מהתפקידים הבאים:",
		mandatory: "הֶכְרֵחִי",
		maxlength: "אורך מקסימלי",
		"meta.group": "קְבוּצָה",
		"meta.icon": "איקו",
		"meta.label": "מַדבֵּקָה",
		minOptionMessage: "שדה זה דורש לפחות 2 אפשרויות",
		name: "שֵׁם",
		newOptionLabel: "{סוג} חדש",
		no: "לֹא",
		number: "מִספָּר",
		off: "כבוי",
		on: "עַל",
		"operator.contains": "מכיל",
		"operator.equals": "שווה",
		"operator.notContains": "לא מכיל",
		"operator.notEquals": "לא שווה",
		"operator.notVisible": "לא נראה לעין",
		"operator.visible": "נִרְאֶה",
		option: "אוֹפְּצִיָה",
		optional: "אופציונלי",
		optionEmpty: "נדרש ערך אופציה",
		optionLabel: "אפשרות {count}",
		options: "אפשרויות",
		or: "אוֹ",
		order: "לְהַזמִין",
		"panel.label.attrs": "תכונות",
		"panel.label.conditions": "תנאים",
		"panel.label.config": "תְצוּרָה",
		"panel.label.meta": "מטא",
		"panel.label.options": "אפשרויות",
		"panelEditButtons.attrs": "+ תכונה",
		"panelEditButtons.conditions": "+ מצב",
		"panelEditButtons.config": "+ תצורה",
		"panelEditButtons.options": "+ אפשרות",
		placeholder: "מציין מקום",
		"placeholder.className": "כיתות מופרדות בחלל",
		"placeholder.email": "הכנס את המייל שלך",
		"placeholder.label": "מַדבֵּקָה",
		"placeholder.password": "הזן את הסיסמה שלך",
		"placeholder.placeholder": "מציין מקום",
		"placeholder.text": "הזן קצת טקסט",
		"placeholder.textarea": "הזן הרבה טקסט",
		"placeholder.value": "עֵרֶך",
		preview: "תצוגה מקדימה",
		primary: "יְסוֹדִי",
		remove: "לְהַסִיר",
		removeMessage: "הסר אלמנט",
		removeType: "הסר {type}",
		required: "דָרוּשׁ",
		reset: "אִתחוּל",
		richText: "עורך טקסט עשיר",
		roles: "גִישָׁה",
		row: "שׁוּרָה",
		"row.makeInputGroup": "הפוך את השורה הזו לקבוצת קלט.",
		"row.makeInputGroupDesc": "קבוצות קלט מאפשרות למשתמשים להוסיף קבוצות של קלט בכל פעם.",
		"row.settings.fieldsetWrap": "עטוף שורה ב-&lt;fieldset&gt; תָג",
		"row.settings.fieldsetWrap.aria": "עטוף שורה ב-Fieldset",
		save: "לְהַצִיל",
		secondary: "מִשׁנִי",
		select: "לִבחוֹר",
		selectColor: "בחר צבע",
		selectionsMessage: "אפשר בחירות מרובות",
		selectOptions: "אפשרויות",
		separator: "מפריד",
		settings: "הגדרות",
		size: "גוֹדֶל",
		sizes: "מידות",
		"sizes.lg": "גָדוֹל",
		"sizes.m": "בְּרִירַת מֶחדָל",
		"sizes.sm": "קָטָן",
		"sizes.xs": "קטן במיוחד",
		style: "סִגְנוֹן",
		styles: "סגנונות",
		"styles.btn": "סגנון כפתור",
		"styles.btn.danger": "סַכָּנָה",
		"styles.btn.default": "בְּרִירַת מֶחדָל",
		"styles.btn.info": "מידע",
		"styles.btn.primary": "יְסוֹדִי",
		"styles.btn.success": "הַצלָחָה",
		"styles.btn.warning": "אַזהָרָה",
		subtype: "סוּג",
		success: "הַצלָחָה",
		text: "שדה טקסט",
		then: "אָז",
		"then.condition.target.placeholder": "יַעַד",
		toggle: "לְמַתֵג",
		ungrouped: "לא מקובץ",
		warning: "אַזהָרָה",
		yes: "כֵּן"
	},
	"hi-IN": {
		"hi-IN": "हिन्दी (भारत)",
		dir: "ltr",
		"en-US": "अंग्रेज़ी",
		"af-ZA": "अफ़्रीकी (दक्षिण अफ़्रीका)",
		"ar-TN": "अरबी (ट्यूनीशिया)",
		"cs-CZ": "चेक (चेकिया)",
		"de-DE": "जर्मन जर्मनी)",
		"es-ES": "यूरोपीय स्पेनिश",
		"fa-IR": "फ़ारसी (ईरान)",
		"fi-FI": "फ़िनिश (फ़िनलैंड)",
		"fr-FR": "फ़्रांस के लोग फ्रेंच)",
		"he-IL": "हिब्रू (इज़राइल)",
		"hu-HU": "हंगेरियन (हंगरी)",
		"it-IT": "इटालियन (इटली)",
		"ja-JP": "जापानी (जापान)",
		"nb-NO": "नॉर्वेजियन बोकमाल (नॉर्वे)",
		"pl-PL": "पोलिश (पोलैंड)",
		"pt-BR": "ब्राज़ीलियन पुर्तगाली",
		"pt-PT": "यूरोपीय पुर्तगाली",
		"ro-RO": "रोमानियाई (रोमानिया)",
		"ru-RU": "रूसी (रूस)",
		"th-TH": "थाई (थाईलैंड)",
		"tr-TR": "तुर्की (तुर्किये)",
		"zh-CN": "चीनी (चीन)",
		"zh-HK": "चीनी (हांगकांग एसएआर चीन)",
		"action.add.attrs.attr": "आप कौन सी विशेषता जोड़ना चाहेंगे?",
		"action.add.attrs.value": "डिफ़ॉल्ट मान",
		addOption: "विकल्प जोड़ें",
		allFieldsRemoved: "सभी फ़ील्ड हटा दिए गए.",
		allowSelect: "चयन की अनुमति दें",
		and: "और",
		attribute: "गुण",
		attributeNotPermitted: "विशेषता \"{attribute}\" की अनुमति नहीं है, कृपया कोई अन्य चुनें.",
		attributes: "गुण",
		"attrs.class": "कक्षा",
		"attrs.className": "कक्षा",
		"attrs.dir": "दिशा",
		"attrs.id": "पहचान",
		"attrs.required": "आवश्यक",
		"attrs.style": "शैली",
		"attrs.title": "शीर्षक",
		"attrs.type": "प्रकार",
		"attrs.value": "कीमत",
		autocomplete: "स्वत: पूर्ण",
		button: "बटन",
		cancel: "रद्द करना",
		cannotBeEmpty: "यह फ़ील्ड रिक्त नहीं रह सकती",
		cannotClearFields: "साफ़ करने के लिए कोई फ़ील्ड नहीं है",
		checkbox: "चेक बॉक्स",
		checkboxes: "चेक बॉक्स",
		class: "कक्षा",
		clear: "स्पष्ट",
		clearAllMessage: "क्या आप वाकई सभी फ़ील्ड साफ़ करना चाहते हैं?",
		close: "बंद करना",
		column: "स्तंभ",
		"condition.target.placeholder": "लक्ष्य",
		"condition.type.and": "और",
		"condition.type.if": "अगर",
		"condition.type.or": "या",
		"condition.type.then": "तब",
		"condition.value.placeholder": "कीमत",
		confirmClearAll: "क्या आप वाकई सभी फ़ील्ड हटाना चाहते हैं?",
		content: "सामग्री",
		control: "नियंत्रण",
		"controlGroups.nextGroup": "अगला समूह",
		"controlGroups.prevGroup": "पिछला समूह",
		"controls.filteringTerm": "फ़िल्टरिंग \"{शब्द}\"",
		"controls.form.button": "बटन",
		"controls.form.checkbox-group": "चेकबॉक्स समूह",
		"controls.form.input.date": "तारीख",
		"controls.form.input.email": "ईमेल",
		"controls.form.input.file": "फ़ाइल अपलोड",
		"controls.form.input.hidden": "छिपा हुआ इनपुट",
		"controls.form.input.number": "संख्या",
		"controls.form.input.text": "पाठ इनपुट",
		"controls.form.radio-group": "रेडियो समूह",
		"controls.form.select": "चुनना",
		"controls.form.textarea": "पाठ क्षेत्र",
		"controls.groups.form": "फॉर्म फ़ील्ड",
		"controls.groups.html": "HTML तत्व",
		"controls.groups.layout": "लेआउट",
		"controls.html.divider": "डिवाइडर",
		"controls.html.header": "हैडर",
		"controls.html.paragraph": "अनुच्छेद",
		"controls.layout.column": "स्तंभ",
		"controls.layout.row": "पंक्ति",
		copy: "क्लिपबोर्ड पर कॉपी करें",
		danger: "खतरा",
		defineColumnLayout: "कॉलम लेआउट परिभाषित करें",
		defineColumnWidths: "स्तंभ की चौड़ाई निर्धारित करें",
		description: "सहायता पाठ",
		descriptionField: "विवरण",
		"editing.row": "संपादन पंक्ति",
		editorTitle: "फॉर्म तत्व",
		field: "मैदान",
		"field.property.invalid": "मान्य नहीं है",
		"field.property.isChecked": "जाँच की गई है",
		"field.property.isNotVisible": "दिखाई नहीं देता",
		"field.property.isVisible": "दिखाई दे रहा है",
		"field.property.label": "लेबल",
		"field.property.valid": "वैध",
		"field.property.value": "कीमत",
		fieldNonEditable: "इस फ़ील्ड को संपादित नहीं किया जा सकता.",
		fieldRemoveWarning: "क्या आप वाकई इस फ़ील्ड को हटाना चाहते हैं?",
		fileUpload: "फ़ाइल अपलोड",
		formUpdated: "फॉर्म अपडेट किया गया",
		getStarted: "आरंभ करने के लिए दाईं ओर से एक फ़ील्ड खींचें.",
		group: "समूह",
		grouped: "समूहीकृत",
		hidden: "छिपा हुआ इनपुट",
		hide: "संपादन करना",
		htmlElements: "HTML तत्व",
		if: "अगर",
		"if.condition.source.placeholder": "स्रोत",
		"if.condition.target.placeholder": "लक्ष्य / मूल्य",
		info: "जानकारी",
		"input.date": "तारीख",
		"input.text": "मूलपाठ",
		label: "लेबल",
		labelCount: "{लेबल} {गिनती}",
		labelEmpty: "फ़ील्ड लेबल रिक्त नहीं हो सकता",
		"lang.af": "अफ़्रीकी",
		"lang.ar": "अरबी",
		"lang.cs": "चेक",
		"lang.de": "जर्मन",
		"lang.en": "अंग्रेज़ी",
		"lang.es": "स्पैनिश",
		"lang.fa": "फ़ारसी",
		"lang.fi": "फिनिश",
		"lang.fr": "फ्रेंच",
		"lang.he": "हिब्रू",
		"lang.hi": "हिन्दी",
		"lang.hu": "हंगेरी",
		"lang.it": "इतालवी",
		"lang.ja": "जापानी",
		"lang.nb": "नॉर्वेजियन बोकमाल",
		"lang.pl": "पोलिश",
		"lang.pt": "पुर्तगाली",
		"lang.ro": "रोमानियाई",
		"lang.ru": "रूसी",
		"lang.th": "थाई",
		"lang.tr": "तुर्की",
		"lang.zh": "चीनी",
		layout: "लेआउट",
		limitRole: "निम्नलिखित में से एक या अधिक भूमिकाओं तक पहुंच सीमित करें:",
		mandatory: "अनिवार्य",
		maxlength: "अधिकतम लंबाई",
		"meta.group": "समूह",
		"meta.icon": "इको",
		"meta.label": "लेबल",
		minOptionMessage: "इस फ़ील्ड में कम से कम 2 विकल्प होने चाहिए",
		name: "नाम",
		newOptionLabel: "नया {प्रकार}",
		no: "नहीं",
		number: "संख्या",
		off: "बंद",
		on: "पर",
		"operator.contains": "रोकना",
		"operator.equals": "के बराबर होती है",
		"operator.notContains": "इसमें शामिल नहीं है",
		"operator.notEquals": "सम नही",
		"operator.notVisible": "दिखाई नहीं देना",
		"operator.visible": "दृश्यमान",
		option: "विकल्प",
		optional: "वैकल्पिक",
		optionEmpty: "विकल्प मान आवश्यक",
		optionLabel: "विकल्प {गिनती}",
		options: "विकल्प",
		or: "या",
		order: "आदेश",
		"panel.label.attrs": "गुण",
		"panel.label.conditions": "स्थितियाँ",
		"panel.label.config": "विन्यास",
		"panel.label.meta": "मेटा",
		"panel.label.options": "विकल्प",
		"panelEditButtons.attrs": "+ विशेषता",
		"panelEditButtons.conditions": "+ शर्त",
		"panelEditButtons.config": "+ कॉन्फ़िगरेशन",
		"panelEditButtons.options": "+ विकल्प",
		placeholder: "प्लेसहोल्डर",
		"placeholder.className": "अंतरिक्ष से अलग की गई कक्षाएं",
		"placeholder.email": "अपना ईमेल दर्ज करें",
		"placeholder.label": "लेबल",
		"placeholder.password": "अपना कूटशब्द भरें",
		"placeholder.placeholder": "प्लेसहोल्डर",
		"placeholder.text": "कुछ पाठ दर्ज करें",
		"placeholder.textarea": "बहुत सारा पाठ दर्ज करें",
		"placeholder.value": "कीमत",
		preview: "पूर्व दर्शन",
		primary: "प्राथमिक",
		remove: "निकालना",
		removeMessage: "तत्व हटाएँ",
		removeType: "{प्रकार} हटाएं",
		required: "आवश्यक",
		reset: "रीसेट करें",
		richText: "रिच टेक्स्ट एडिटर",
		roles: "पहुँच",
		row: "पंक्ति",
		"row.makeInputGroup": "इस पंक्ति को एक इनपुट समूह बनाएं.",
		"row.makeInputGroupDesc": "इनपुट समूह उपयोगकर्ताओं को एक समय में इनपुट के सेट जोड़ने में सक्षम बनाता है।",
		"row.settings.fieldsetWrap": "पंक्ति को &lt;fieldset&gt; टैग में लपेटें",
		"row.settings.fieldsetWrap.aria": "फ़ील्डसेट में पंक्ति लपेटें",
		save: "बचाना",
		secondary: "माध्यमिक",
		select: "चुनना",
		selectColor: "रंग चुनो",
		selectionsMessage: "एकाधिक चयन की अनुमति दें",
		selectOptions: "विकल्प",
		separator: "सेपरेटर",
		settings: "सेटिंग्स",
		size: "आकार",
		sizes: "आकार",
		"sizes.lg": "बड़ा",
		"sizes.m": "गलती करना",
		"sizes.sm": "छोटा",
		"sizes.xs": "अतिरिक्त छोटा",
		style: "शैली",
		styles: "शैलियों",
		"styles.btn": "बटन शैली",
		"styles.btn.danger": "खतरा",
		"styles.btn.default": "गलती करना",
		"styles.btn.info": "जानकारी",
		"styles.btn.primary": "प्राथमिक",
		"styles.btn.success": "सफलता",
		"styles.btn.warning": "चेतावनी",
		subtype: "प्रकार",
		success: "सफलता",
		text: "पाठ्य से भरा",
		then: "तब",
		"then.condition.target.placeholder": "लक्ष्य",
		toggle: "टॉगल",
		ungrouped: "अन-वर्गीकृत किया",
		warning: "चेतावनी",
		yes: "हाँ"
	},
	"hu-HU": {
		"hu-HU": "magyar (Magyarország)",
		dir: "ltr",
		"en-US": "angol",
		"af-ZA": "afrikaans (Dél-afrikai Köztársaság)",
		"ar-TN": "arab (Tunézia)",
		"cs-CZ": "cseh (Csehország)",
		"de-DE": "német (Németország)",
		"es-ES": "európai spanyol",
		"fa-IR": "perzsa (Irán)",
		"fi-FI": "finn (Finnország)",
		"fr-FR": "francia (Franciaország)",
		"he-IL": "héber (Izrael)",
		"hi-IN": "hindi (India)",
		"it-IT": "olasz (Olaszország)",
		"ja-JP": "japán (Japán)",
		"nb-NO": "norvég (bokmål) (Norvégia)",
		"pl-PL": "lengyel (Lengyelország)",
		"pt-BR": "brazíliai portugál",
		"pt-PT": "európai portugál",
		"ro-RO": "román (Románia)",
		"ru-RU": "orosz (Oroszország)",
		"th-TH": "thai (Thaiföld)",
		"tr-TR": "török (Törökország)",
		"zh-CN": "kínai (Kína)",
		"zh-HK": "kínai (Hongkong KKT)",
		"action.add.attrs.attr": "Milyen tulajdonságot szeretnél hozzáadni?",
		"action.add.attrs.value": "Alapértelmezett érték",
		addOption: "Opció hozzáadása",
		allFieldsRemoved: "Minden mezőt eltávolítottunk.",
		allowSelect: "Engedélyezze a Kiválasztást",
		and: "és",
		attribute: "Tulajdonság",
		attributeNotPermitted: "A (z) \"{attribute}\" attribútum nem engedélyezett, kérjük, válasszon másikat.",
		attributes: "attribútumok",
		"attrs.class": "Osztály",
		"attrs.className": "Osztály",
		"attrs.dir": "Irány",
		"attrs.id": "Id",
		"attrs.required": "Kívánt",
		"attrs.style": "Stílus",
		"attrs.title": "Cím",
		"attrs.type": "típus",
		"attrs.value": "Érték",
		autocomplete: "Automatikus kiegészítés",
		button: "Gomb",
		cancel: "Mégsem",
		cannotBeEmpty: "Ez a mező nem lehet üres",
		cannotClearFields: "Nincs törölni kívánt mező",
		checkbox: "jelölőnégyzetet",
		checkboxes: "négyzeteket",
		class: "Osztály",
		clear: "Egyértelmű",
		clearAllMessage: "Biztosan törölni szeretné az összes mezőt?",
		close: "Bezárás",
		column: "Oszlop",
		"condition.target.placeholder": "cél",
		"condition.type.and": "És",
		"condition.type.if": "Ha",
		"condition.type.or": "Vagy",
		"condition.type.then": "Majd",
		"condition.value.placeholder": "érték",
		confirmClearAll: "Biztosan eltávolít minden mezőt?",
		content: "Tartalom",
		control: "Ellenőrzés",
		"controlGroups.nextGroup": "Következő csoport",
		"controlGroups.prevGroup": "Előző csoport",
		"controls.filteringTerm": "A (z) \"{term}\" szűrése",
		"controls.form.button": "Gomb",
		"controls.form.checkbox-group": "Checkbox Group",
		"controls.form.input.date": "Dátum",
		"controls.form.input.email": "Email",
		"controls.form.input.file": "Fájlfeltöltés",
		"controls.form.input.hidden": "Rejtett bemenet",
		"controls.form.input.number": "Szám",
		"controls.form.input.text": "Szövegbevitel",
		"controls.form.radio-group": "Radio Group",
		"controls.form.select": "választ",
		"controls.form.textarea": "a szövegszerkesztő",
		"controls.groups.form": "Űrlapmezők",
		"controls.groups.html": "HTML Elemek",
		"controls.groups.layout": "Elrendezés",
		"controls.html.divider": "Osztó",
		"controls.html.header": "Fejléc",
		"controls.html.paragraph": "Bekezdés",
		"controls.layout.column": "Oszlop",
		"controls.layout.row": "Sor",
		copy: "Másolja a vágólapra",
		danger: "Veszély",
		defineColumnLayout: "Állítsa be az oszlop elrendezését",
		defineColumnWidths: "Határozza meg az oszlopszélességeket",
		description: "Súgószöveg",
		descriptionField: "Leírás",
		"editing.row": "Sor szerkesztése",
		editorTitle: "Form Elemek",
		field: "Mező",
		"field.property.invalid": "nem érvényes",
		"field.property.isChecked": "ellenőrizve van",
		"field.property.isNotVisible": "nem látható",
		"field.property.isVisible": "látható",
		"field.property.label": "címke",
		"field.property.valid": "érvényes",
		"field.property.value": "érték",
		fieldNonEditable: "Ez a mező nem szerkeszthető.",
		fieldRemoveWarning: "Biztosan eltávolítja ezt a mezőt?",
		fileUpload: "Fájlfeltöltés",
		formUpdated: "Frissített űrlap",
		getStarted: "Húzzon egy mezőt jobbra, hogy elinduljon.",
		group: "Csoport",
		grouped: "csoportosított",
		hidden: "Rejtett bemenet",
		hide: "szerkesztése",
		htmlElements: "HTML Elemek",
		if: "Ha",
		"if.condition.source.placeholder": "forrás",
		"if.condition.target.placeholder": "célérték",
		info: "Info",
		"input.date": "Dátum",
		"input.text": "Szöveg",
		label: "Címke",
		labelCount: "{label} {count}",
		labelEmpty: "A mezőcímke nem lehet üres",
		"lang.af": "afrikai",
		"lang.ar": "arab",
		"lang.cs": "cseh",
		"lang.de": "német",
		"lang.en": "angol",
		"lang.es": "spanyol",
		"lang.fa": "perzsa",
		"lang.fi": "finn",
		"lang.fr": "francia",
		"lang.he": "héber",
		"lang.hi": "hindi",
		"lang.hu": "magyar",
		"lang.it": "olasz",
		"lang.ja": "japán",
		"lang.nb": "norvég bokmål",
		"lang.pl": "lengyel",
		"lang.pt": "portugál",
		"lang.ro": "román",
		"lang.ru": "orosz",
		"lang.th": "thai",
		"lang.tr": "török",
		"lang.zh": "kínai",
		layout: "Elrendezés",
		limitRole: "A következő szerepek közül egy vagy több korlátozása:",
		mandatory: "Kötelező",
		maxlength: "Max. Hosszúság",
		"meta.group": "Csoport",
		"meta.icon": "Ico",
		"meta.label": "Címke",
		minOptionMessage: "Ez a mező legalább 2 opciót igényel",
		name: "Név",
		newOptionLabel: "Új {típus}",
		no: "Nem",
		number: "Szám",
		off: "Ki",
		on: "Tovább",
		"operator.contains": "tartalmaz",
		"operator.equals": "egyenlő",
		"operator.notContains": "nem tartalmaz",
		"operator.notEquals": "nem egyenlő",
		"operator.notVisible": "nem látható",
		"operator.visible": "látható",
		option: "választási lehetőség",
		optional: "választható",
		optionEmpty: "Opciós érték szükséges",
		optionLabel: "Opció {count}",
		options: "Opciók",
		or: "vagy",
		order: "Sorrend",
		"panel.label.attrs": "attribútumok",
		"panel.label.conditions": "Körülmények",
		"panel.label.config": "Configuration",
		"panel.label.meta": "meta",
		"panel.label.options": "Opciók",
		"panelEditButtons.attrs": "+ Attribútum",
		"panelEditButtons.conditions": "+ Állapot",
		"panelEditButtons.config": "+ Konfiguráció",
		"panelEditButtons.options": "+ Opció",
		placeholder: "Helykitöltő",
		"placeholder.className": "űrszeparált osztályok",
		"placeholder.email": "Adja meg az e-mailt",
		"placeholder.label": "Címke",
		"placeholder.password": "Írd be a jelszavad",
		"placeholder.placeholder": "Helykitöltő",
		"placeholder.text": "Adjon meg egy szöveget",
		"placeholder.textarea": "Adjon meg egy csomó szöveget",
		"placeholder.value": "Érték",
		preview: "Előnézet",
		primary: "Elsődleges",
		remove: "eltávolít",
		removeMessage: "Elem eltávolítása",
		removeType: "Remove {type}",
		required: "Kívánt",
		reset: "Visszaállítás",
		richText: "Rich Text Editor",
		roles: "Hozzáférés",
		row: "Sor",
		"row.makeInputGroup": "A beviteli csoport létrehozása.",
		"row.makeInputGroupDesc": "A beviteli csoportok lehetővé teszik a felhasználók számára, hogy egy időben hozzáadják a bemeneti készleteket.",
		"row.settings.fieldsetWrap": "A <fieldset & gt; címke",
		"row.settings.fieldsetWrap.aria": "Wrap sor a Fieldsetben",
		save: "Mentés",
		secondary: "Másodlagos",
		select: "választ",
		selectColor: "Válassza a Szín lehetőséget",
		selectionsMessage: "Többszörös kiválasztás engedélyezése",
		selectOptions: "Opciók",
		separator: "Szétválasztó",
		settings: "Beállítások",
		size: "Méret",
		sizes: "méretek",
		"sizes.lg": "Nagy",
		"sizes.m": "Alapértelmezett",
		"sizes.sm": "Kicsi",
		"sizes.xs": "Extra kicsi",
		style: "Stílus",
		styles: "Stílusok",
		"styles.btn": "Gomb stílus",
		"styles.btn.danger": "Veszély",
		"styles.btn.default": "Alapértelmezett",
		"styles.btn.info": "Info",
		"styles.btn.primary": "Elsődleges",
		"styles.btn.success": "Siker",
		"styles.btn.warning": "Figyelem",
		subtype: "típus",
		success: "Siker",
		text: "Szövegmező",
		then: "Azután",
		"then.condition.target.placeholder": "cél",
		toggle: "pecek",
		ungrouped: "A csoportosított",
		warning: "Figyelem",
		yes: "Igen"
	},
	"it-IT": {
		"it-IT": "italiano (Italia)",
		dir: "ltr",
		"en-US": "Inglese",
		"af-ZA": "afrikaans (Sudafrica)",
		"ar-TN": "arabo (Tunisia)",
		"cs-CZ": "ceco (Cechia)",
		"de-DE": "tedesco (Germania)",
		"es-ES": "spagnolo europeo",
		"fa-IR": "persiano (Iran)",
		"fi-FI": "finlandese (Finlandia)",
		"fr-FR": "francese (Francia)",
		"he-IL": "ebraico (Israele)",
		"hi-IN": "hindi (India)",
		"hu-HU": "ungherese (Ungheria)",
		"ja-JP": "giapponese (Giappone)",
		"nb-NO": "norvegese bokmål (Norvegia)",
		"pl-PL": "polacco (Polonia)",
		"pt-BR": "portoghese brasiliano",
		"pt-PT": "portoghese europeo",
		"ro-RO": "rumeno (Romania)",
		"ru-RU": "russo (Russia)",
		"th-TH": "thailandese (Thailandia)",
		"tr-TR": "turco (Turchia)",
		"zh-CN": "cinese (Cina)",
		"zh-HK": "cinese (RAS di Hong Kong)",
		"action.add.attrs.attr": "Quale attributo vorresti aggiungere?",
		"action.add.attrs.value": "Valore predefinito",
		addOption: "Aggiungi opzione",
		allFieldsRemoved: "Tutti i campi sono stati rimossi.",
		allowSelect: "Consenti selezione",
		and: "e",
		attribute: "Attributo",
		attributeNotPermitted: `L'attributo "{attribute}" non è permesso, per favore sceglierne un altro.`,
		attributes: "attributi",
		"attrs.class": "Classe",
		"attrs.className": "Classe",
		"attrs.dir": "Direzione",
		"attrs.id": "Id",
		"attrs.required": "necessario",
		"attrs.style": "Stile",
		"attrs.title": "Titolo",
		"attrs.type": "genere",
		"attrs.value": "Valore",
		autocomplete: "Completamento automatico",
		button: "Pulsante",
		cancel: "Cancellare",
		cannotBeEmpty: "Questo campo non può essere vuoto",
		cannotClearFields: "Non ci sono campi da cancellare",
		checkbox: "casella di controllo",
		checkboxes: "caselle di controllo",
		class: "Classe",
		clear: "Chiaro",
		clearAllMessage: "Sei sicuro di voler cancellare tutti i campi?",
		close: "Vicino",
		column: "Colonna",
		"condition.target.placeholder": "bersaglio",
		"condition.type.and": "E",
		"condition.type.if": "Se",
		"condition.type.or": "O",
		"condition.type.then": "Poi",
		"condition.value.placeholder": "valore",
		confirmClearAll: "Sei sicuro di voler rimuovere tutti i campi?",
		content: "Soddisfare",
		control: "Controllo",
		"controlGroups.nextGroup": "Gruppo successivo",
		"controlGroups.prevGroup": "Gruppo precedente",
		"controls.filteringTerm": "Filtro \"{term}\"",
		"controls.form.button": "Pulsante",
		"controls.form.checkbox-group": "Gruppo di caselle di controllo",
		"controls.form.input.date": "Data",
		"controls.form.input.email": "E-mail",
		"controls.form.input.file": "Upload di file",
		"controls.form.input.hidden": "Ingresso nascosto",
		"controls.form.input.number": "Numero",
		"controls.form.input.text": "L'immissione di testo",
		"controls.form.radio-group": "Gruppo Radio",
		"controls.form.select": "Selezionare",
		"controls.form.textarea": "TextArea",
		"controls.groups.form": "Campi modulo",
		"controls.groups.html": "Elementi HTML",
		"controls.groups.layout": "disposizione",
		"controls.html.divider": "Divisore",
		"controls.html.header": "Intestazione",
		"controls.html.paragraph": "Paragrafo",
		"controls.layout.column": "Colonna",
		"controls.layout.row": "Riga",
		copy: "Copia negli appunti",
		danger: "Pericolo",
		defineColumnLayout: "Definire un layout di colonna",
		defineColumnWidths: "Definire le larghezze delle colonne",
		description: "Testo guida",
		descriptionField: "Descrizione",
		"editing.row": "Modifica riga",
		editorTitle: "Elementi del modulo",
		field: "Campo",
		"field.property.invalid": "non valido",
		"field.property.isChecked": "è controllato",
		"field.property.isNotVisible": "non è visibile",
		"field.property.isVisible": "è visibile",
		"field.property.label": "etichetta",
		"field.property.valid": "valido",
		"field.property.value": "valore",
		fieldNonEditable: "Questo campo non può essere modificato.",
		fieldRemoveWarning: "Sei sicuro di voler rimuovere questo campo?",
		fileUpload: "Upload di file",
		formUpdated: "Modulo aggiornato",
		getStarted: "Trascina un campo da destra per iniziare.",
		group: "Gruppo",
		grouped: "raggruppate",
		hidden: "Ingresso nascosto",
		hide: "modificare",
		htmlElements: "Elementi HTML",
		if: "Se",
		"if.condition.source.placeholder": "fonte",
		"if.condition.target.placeholder": "obiettivo / valore",
		info: "Informazioni",
		"input.date": "Data",
		"input.text": "Testo",
		label: "Etichetta",
		labelCount: "{label} {count}",
		labelEmpty: "Field Label non può essere vuoto",
		"lang.af": "africano",
		"lang.ar": "arabo",
		"lang.cs": "ceco",
		"lang.de": "tedesco",
		"lang.en": "Inglese",
		"lang.es": "spagnolo",
		"lang.fa": "persiano",
		"lang.fi": "finlandese",
		"lang.fr": "francese",
		"lang.he": "ebraico",
		"lang.hi": "hindi",
		"lang.hu": "ungherese",
		"lang.it": "Italiano",
		"lang.ja": "giapponese",
		"lang.nb": "Bokmål norvegese",
		"lang.pl": "Polacco",
		"lang.pt": "portoghese",
		"lang.ro": "rumeno",
		"lang.ru": "russo",
		"lang.th": "tailandese",
		"lang.tr": "turco",
		"lang.zh": "cinese",
		layout: "disposizione",
		limitRole: "Limitare l'accesso a uno o più dei seguenti ruoli:",
		mandatory: "Obbligatorio",
		maxlength: "Lunghezza massima",
		"meta.group": "Gruppo",
		"meta.icon": "Ico",
		"meta.label": "Etichetta",
		minOptionMessage: "Questo campo richiede un minimo di 2 opzioni",
		name: "Nome",
		newOptionLabel: "Nuovo tipo}",
		no: "No",
		number: "Numero",
		off: "via",
		on: "Sopra",
		"operator.contains": "contiene",
		"operator.equals": "è uguale a",
		"operator.notContains": "non contiene",
		"operator.notEquals": "non uguale",
		"operator.notVisible": "non visibile",
		"operator.visible": "visibile",
		option: "Opzione",
		optional: "opzionale",
		optionEmpty: "Opzione valore richiesto",
		optionLabel: "Opzione {count}",
		options: "Opzioni",
		or: "o",
		order: "Ordine",
		"panel.label.attrs": "attributi",
		"panel.label.conditions": "condizioni",
		"panel.label.config": "Configurazione",
		"panel.label.meta": "Meta",
		"panel.label.options": "Opzioni",
		"panelEditButtons.attrs": "+ Attributo",
		"panelEditButtons.conditions": "+ Condizione",
		"panelEditButtons.config": "+ Configurazione",
		"panelEditButtons.options": "+ Opzione",
		placeholder: "segnaposto",
		"placeholder.className": "classi separate dallo spazio",
		"placeholder.email": "Inserisci la tua email",
		"placeholder.label": "Etichetta",
		"placeholder.password": "Inserisci la tua password",
		"placeholder.placeholder": "segnaposto",
		"placeholder.text": "Inserisci del testo",
		"placeholder.textarea": "Inserisci un sacco di testo",
		"placeholder.value": "Valore",
		preview: "Anteprima",
		primary: "Primario",
		remove: "Rimuovere",
		removeMessage: "Rimuovi elemento",
		removeType: "Rimuovi {tipo}",
		required: "necessario",
		reset: "Reset",
		richText: "Rich Text Editor",
		roles: "Accesso",
		row: "Riga",
		"row.makeInputGroup": "Rendi questa riga un gruppo di input.",
		"row.makeInputGroupDesc": "I gruppi di input consentono agli utenti di aggiungere insiemi di input alla volta.",
		"row.settings.fieldsetWrap": "Racchiudi la riga in un & lt; fieldset & gt; etichetta",
		"row.settings.fieldsetWrap.aria": "Wrap Row in Fieldset",
		save: "Salvare",
		secondary: "Secondario",
		select: "Selezionare",
		selectColor: "Seleziona colore",
		selectionsMessage: "Consenti selezioni multiple",
		selectOptions: "Opzioni",
		separator: "Separatore",
		settings: "impostazioni",
		size: "Taglia",
		sizes: "taglie",
		"sizes.lg": "Grande",
		"sizes.m": "Predefinito",
		"sizes.sm": "Piccolo",
		"sizes.xs": "Piccolissimo",
		style: "Stile",
		styles: "stili",
		"styles.btn": "Stile del bottone",
		"styles.btn.danger": "Pericolo",
		"styles.btn.default": "Predefinito",
		"styles.btn.info": "Informazioni",
		"styles.btn.primary": "Primario",
		"styles.btn.success": "Successo",
		"styles.btn.warning": "avvertimento",
		subtype: "genere",
		success: "Successo",
		text: "Campo di testo",
		then: "Poi",
		"then.condition.target.placeholder": "bersaglio",
		toggle: "Toggle",
		ungrouped: "A-raggruppati",
		warning: "avvertimento",
		yes: "sì"
	},
	"ja-JP": {
		"ja-JP": "日本語 (日本)",
		dir: "ltr",
		"en-US": "英語",
		"af-ZA": "アフリカーンス語 (南アフリカ)",
		"ar-TN": "アラビア語 (チュニジア)",
		"cs-CZ": "チェコ語 (チェコ)",
		"de-DE": "ドイツ語 (ドイツ)",
		"es-ES": "スペイン語 (イベリア半島)",
		"fa-IR": "ペルシア語 (イラン)",
		"fi-FI": "フィンランド語 (フィンランド)",
		"fr-FR": "フランス語 (フランス)",
		"he-IL": "ヘブライ語 (イスラエル)",
		"hi-IN": "ヒンディー語 (インド)",
		"hu-HU": "ハンガリー語 (ハンガリー)",
		"it-IT": "イタリア語 (イタリア)",
		"nb-NO": "ノルウェー語(ブークモール) (ノルウェー)",
		"pl-PL": "ポーランド語 (ポーランド)",
		"pt-BR": "ポルトガル語 (ブラジル)",
		"pt-PT": "ポルトガル語 (イベリア半島)",
		"ro-RO": "ルーマニア語 (ルーマニア)",
		"ru-RU": "ロシア語 (ロシア)",
		"th-TH": "タイ語 (タイ)",
		"tr-TR": "トルコ語 (トルコ)",
		"zh-CN": "中国語 (中国)",
		"zh-HK": "中国語 (中華人民共和国香港特別行政区)",
		"action.add.attrs.attr": "どのような属性を追加しますか？",
		"action.add.attrs.value": "デフォルト値",
		addOption: "オプションを追加",
		allFieldsRemoved: "すべてのフィールドが削除されました。",
		allowSelect: "選択を許可する",
		and: "そして",
		attribute: "属性",
		attributeNotPermitted: "属性 \"{属性}\"は許可されていません。別の属性を選択してください。",
		attributes: "属性",
		"attrs.class": "クラス",
		"attrs.className": "クラス",
		"attrs.dir": "方向",
		"attrs.id": "イド",
		"attrs.required": "必須",
		"attrs.style": "スタイル",
		"attrs.title": "タイトル",
		"attrs.type": "タイプ",
		"attrs.value": "値",
		autocomplete: "オートコンプリート",
		button: "ボタン",
		cancel: "キャンセル",
		cannotBeEmpty: "このフィールドは空白にすることはできません",
		cannotClearFields: "クリアするフィールドはありません",
		checkbox: "チェックボックス",
		checkboxes: "チェックボックス",
		class: "クラス",
		clear: "クリア",
		clearAllMessage: "すべてのフィールドをクリアしてもよろしいですか？",
		close: "閉じる",
		column: "カラム",
		"condition.target.placeholder": "ターゲット",
		"condition.type.and": "そして",
		"condition.type.if": "もし",
		"condition.type.or": "または",
		"condition.type.then": "それから",
		"condition.value.placeholder": "値",
		confirmClearAll: "すべてのフィールドを削除してもよろしいですか？",
		content: "コンテンツ",
		control: "コントロール",
		"controlGroups.nextGroup": "次のグループ",
		"controlGroups.prevGroup": "前のグループ",
		"controls.filteringTerm": "フィルタリング \"{term}\"",
		"controls.form.button": "ボタン",
		"controls.form.checkbox-group": "チェックボックスグループ",
		"controls.form.input.date": "日付",
		"controls.form.input.email": "Eメール",
		"controls.form.input.file": "ファイルアップロード",
		"controls.form.input.hidden": "隠された入力",
		"controls.form.input.number": "数",
		"controls.form.input.text": "テキスト入力",
		"controls.form.radio-group": "ラジオ・グループ",
		"controls.form.select": "選択",
		"controls.form.textarea": "TextArea",
		"controls.groups.form": "フォームフィールド",
		"controls.groups.html": "HTML要素",
		"controls.groups.layout": "レイアウト",
		"controls.html.divider": "ディバイダー",
		"controls.html.header": "ヘッダ",
		"controls.html.paragraph": "段落",
		"controls.layout.column": "カラム",
		"controls.layout.row": "行",
		copy: "クリップボードにコピー",
		danger: "危険",
		defineColumnLayout: "列のレイアウトを定義する",
		defineColumnWidths: "列の幅を定義する",
		description: "ヘルプテキスト",
		descriptionField: "説明",
		"editing.row": "行の編集",
		editorTitle: "フォーム要素",
		field: "フィールド",
		"field.property.invalid": "有効ではありません",
		"field.property.isChecked": "チェックされている",
		"field.property.isNotVisible": "見えない",
		"field.property.isVisible": "目に見える",
		"field.property.label": "ラベル",
		"field.property.valid": "有効な",
		"field.property.value": "値",
		fieldNonEditable: "このフィールドは編集できません。",
		fieldRemoveWarning: "このフィールドを削除してもよろしいですか？",
		fileUpload: "ファイルアップロード",
		formUpdated: "フォームの更新",
		getStarted: "フィールドを右からドラッグして開始します。",
		group: "グループ",
		grouped: "グループ化された",
		hidden: "隠された入力",
		hide: "編集",
		htmlElements: "HTML要素",
		if: "もし",
		"if.condition.source.placeholder": "ソース",
		"if.condition.target.placeholder": "ターゲット/値",
		info: "情報",
		"input.date": "日付",
		"input.text": "テキスト",
		label: "ラベル",
		labelCount: "{label} {count}",
		labelEmpty: "フィールドラベルを空にすることはできません",
		"lang.af": "アフリカ人",
		"lang.ar": "アラビア語",
		"lang.cs": "チェコ語",
		"lang.de": "ドイツ語",
		"lang.en": "英語",
		"lang.es": "スペイン語",
		"lang.fa": "ペルシャ語",
		"lang.fi": "フィンランド語",
		"lang.fr": "フランス語",
		"lang.he": "ヘブライ語",
		"lang.hi": "ヒンディー語",
		"lang.hu": "ハンガリー語",
		"lang.it": "イタリア語",
		"lang.ja": "日本語",
		"lang.nb": "ノルウェー語ブークモール",
		"lang.pl": "研磨",
		"lang.pt": "ポルトガル語",
		"lang.ro": "ルーマニア語",
		"lang.ru": "ロシア",
		"lang.th": "タイ語",
		"lang.tr": "トルコ語",
		"lang.zh": "中国語",
		layout: "レイアウト",
		limitRole: "以下の役割の1つ以上にアクセスを制限する：",
		mandatory: "必須",
		maxlength: "最大長",
		"meta.group": "グループ",
		"meta.icon": "イコ",
		"meta.label": "ラベル",
		minOptionMessage: "このフィールドには最低2つのオプションが必要です",
		name: "名",
		newOptionLabel: "新しいタイプ}",
		no: "いいえ",
		number: "数",
		off: "オフ",
		on: "に",
		"operator.contains": "含まれる",
		"operator.equals": "等しい",
		"operator.notContains": "含まれていない",
		"operator.notEquals": "等しくない",
		"operator.notVisible": "目に見えない",
		"operator.visible": "目に見える",
		option: "オプション",
		optional: "オプション",
		optionEmpty: "オプション値が必要です",
		optionLabel: "オプション{count}",
		options: "オプション",
		or: "または",
		order: "注文",
		"panel.label.attrs": "属性",
		"panel.label.conditions": "条件",
		"panel.label.config": "構成",
		"panel.label.meta": "メタ",
		"panel.label.options": "オプション",
		"panelEditButtons.attrs": "+属性",
		"panelEditButtons.conditions": "+条件",
		"panelEditButtons.config": "+ 構成",
		"panelEditButtons.options": "+オプション",
		placeholder: "プレースホルダ",
		"placeholder.className": "スペースで区切られたクラス",
		"placeholder.email": "あなたにメールを入力",
		"placeholder.label": "ラベル",
		"placeholder.password": "パスワードを入力してください",
		"placeholder.placeholder": "プレースホルダ",
		"placeholder.text": "テキストを入力",
		"placeholder.textarea": "たくさんのテキストを入力してください",
		"placeholder.value": "値",
		preview: "プレビュー",
		primary: "一次",
		remove: "削除する",
		removeMessage: "要素を削除する",
		removeType: "{タイプ}を削除",
		required: "必須",
		reset: "リセット",
		richText: "リッチテキストエディタ",
		roles: "アクセス",
		row: "行",
		"row.makeInputGroup": "この行を入力グループにします。",
		"row.makeInputGroupDesc": "入力グループを使用すると、一度に入力セットを追加できます。",
		"row.settings.fieldsetWrap": "＆lt; fieldset＆gt;フィールドに行をラップします。タグ",
		"row.settings.fieldsetWrap.aria": "行をフィールドセットで折り返す",
		save: "保存する",
		secondary: "二次",
		select: "選択",
		selectColor: "カラーを選択",
		selectionsMessage: "複数の選択を許可する",
		selectOptions: "オプション",
		separator: "セパレータ",
		settings: "設定",
		size: "サイズ",
		sizes: "サイズ",
		"sizes.lg": "大",
		"sizes.m": "デフォルト",
		"sizes.sm": "小さい",
		"sizes.xs": "極小",
		style: "スタイル",
		styles: "スタイル",
		"styles.btn": "ボタンスタイル",
		"styles.btn.danger": "危険",
		"styles.btn.default": "デフォルト",
		"styles.btn.info": "情報",
		"styles.btn.primary": "一次",
		"styles.btn.success": "成功",
		"styles.btn.warning": "警告",
		subtype: "タイプ",
		success: "成功",
		text: "テキストフィールド",
		then: "その後、",
		"then.condition.target.placeholder": "ターゲット",
		toggle: "トグル",
		ungrouped: "- グループ化",
		warning: "警告",
		yes: "はい"
	},
	"nb-NO": {
		"nb-NO": "norsk bokmål (Norge)",
		dir: "ltr",
		"en-US": "Engelsk",
		"af-ZA": "afrikaans (Sør-Afrika)",
		"ar-TN": "arabisk (Tunisia)",
		"cs-CZ": "tsjekkisk (Tsjekkia)",
		"de-DE": "tysk (Tyskland)",
		"es-ES": "spansk (Spania)",
		"fa-IR": "persisk (Iran)",
		"fi-FI": "finsk (Finland)",
		"fr-FR": "fransk (Frankrike)",
		"he-IL": "hebraisk (Israel)",
		"hi-IN": "hindi (India)",
		"hu-HU": "ungarsk (Ungarn)",
		"it-IT": "italiensk (Italia)",
		"ja-JP": "japansk (Japan)",
		"pl-PL": "polsk (Polen)",
		"pt-BR": "portugisisk (Brasil)",
		"pt-PT": "portugisisk (Portugal)",
		"ro-RO": "rumensk (Romania)",
		"ru-RU": "russisk (Russland)",
		"th-TH": "thai (Thailand)",
		"tr-TR": "tyrkisk (Tyrkia)",
		"zh-CN": "kinesisk (Kina)",
		"zh-HK": "kinesisk (Hongkong SAR Kina)",
		"action.add.attrs.attr": "Hvilken egenskap vil du legge til?",
		"action.add.attrs.value": "Standardverdi",
		addOption: "Legg til alternativ",
		allFieldsRemoved: "Alle feltene ble fjernet.",
		allowSelect: "Tillat Select",
		and: "og",
		attribute: "Egenskap",
		attributeNotPermitted: "Attributt \"{attribute}\" er ikke tillatt, vennligst velg en annen.",
		attributes: "Egenskaper",
		"attrs.class": "Klasse",
		"attrs.className": "Klasse",
		"attrs.dir": "Retning",
		"attrs.id": "id",
		"attrs.required": "Må",
		"attrs.style": "Stil",
		"attrs.title": "Tittel",
		"attrs.type": "Type",
		"attrs.value": "Verdi",
		autocomplete: "Autofullfør",
		button: "Knapp",
		cancel: "Kansellere",
		cannotBeEmpty: "Dette feltet kan ikke være tomt",
		cannotClearFields: "Det er ingen felt å slette",
		checkbox: "avkrysnings",
		checkboxes: "boksene",
		class: "Klasse",
		clear: "Klar",
		clearAllMessage: "Er du sikker på at du vil slette alle feltene?",
		close: "Lukk",
		column: "Kolonne",
		"condition.target.placeholder": "mål",
		"condition.type.and": "Og",
		"condition.type.if": "Hvis",
		"condition.type.or": "Eller",
		"condition.type.then": "Da",
		"condition.value.placeholder": "verdi",
		confirmClearAll: "Er du sikker på at du vil fjerne alle feltene?",
		content: "Innhold",
		control: "Styre",
		"controlGroups.nextGroup": "Neste gruppe",
		"controlGroups.prevGroup": "Forrige gruppe",
		"controls.filteringTerm": "Filtrering \"{term}\"",
		"controls.form.button": "Knapp",
		"controls.form.checkbox-group": "Kryssboksgruppe",
		"controls.form.input.date": "Dato",
		"controls.form.input.email": "e-post",
		"controls.form.input.file": "Filopplasting",
		"controls.form.input.hidden": "Skjult inngang",
		"controls.form.input.number": "Nummer",
		"controls.form.input.text": "Tekstinngang",
		"controls.form.radio-group": "Radio gruppe",
		"controls.form.select": "Å velge",
		"controls.form.textarea": "Tekstfelt",
		"controls.groups.form": "Form Fields",
		"controls.groups.html": "HTML-elementer",
		"controls.groups.layout": "Oppsett",
		"controls.html.divider": "Deler",
		"controls.html.header": "Overskrift",
		"controls.html.paragraph": "Avsnitt",
		"controls.layout.column": "Kolonne",
		"controls.layout.row": "Rad",
		copy: "Kopiere til utklippstavle",
		danger: "Fare",
		defineColumnLayout: "Definer en kolonneoppsett",
		defineColumnWidths: "Definer kolonnebredder",
		description: "Hjelpetekst",
		descriptionField: "Beskrivelse",
		"editing.row": "Redigerer rad",
		editorTitle: "Formelementer",
		field: "Felt",
		"field.property.invalid": "ikke gyldig",
		"field.property.isChecked": "er sjekket",
		"field.property.isNotVisible": "er ikke synlig",
		"field.property.isVisible": "er synlig",
		"field.property.label": "merkelapp",
		"field.property.valid": "gyldig",
		"field.property.value": "verdi",
		fieldNonEditable: "Dette feltet kan ikke redigeres.",
		fieldRemoveWarning: "Er du sikker på at du vil fjerne dette feltet?",
		fileUpload: "Filopplasting",
		formUpdated: "Form oppdatert",
		getStarted: "Dra et felt fra høyre for å komme i gang.",
		group: "Gruppe",
		grouped: "gruppert",
		hidden: "Skjult inngang",
		hide: "Redigere",
		htmlElements: "HTML-elementer",
		if: "Hvis",
		"if.condition.source.placeholder": "kilde",
		"if.condition.target.placeholder": "målverdi",
		info: "info",
		"input.date": "Dato",
		"input.text": "Tekst",
		label: "Merkelapp",
		labelCount: "{label} {count}",
		labelEmpty: "Feltetikett kan ikke være tomt",
		"lang.af": "afrikansk",
		"lang.ar": "arabisk",
		"lang.cs": "tsjekkisk",
		"lang.de": "tysk",
		"lang.en": "engelsk",
		"lang.es": "spansk",
		"lang.fa": "persisk",
		"lang.fi": "finsk",
		"lang.fr": "fransk",
		"lang.he": "hebraisk",
		"lang.hi": "hindi",
		"lang.hu": "ungarsk",
		"lang.it": "italiensk",
		"lang.ja": "japansk",
		"lang.nb": "Norwegian Bokmål",
		"lang.pl": "Pusse",
		"lang.pt": "portugisisk",
		"lang.ro": "rumensk",
		"lang.ru": "russisk",
		"lang.th": "Thai",
		"lang.tr": "tyrkisk",
		"lang.zh": "kinesisk",
		layout: "Oppsett",
		limitRole: "Begrens tilgang til en eller flere av følgende roller:",
		mandatory: "Påbudt, bindende",
		maxlength: "Maks lengde",
		"meta.group": "Gruppe",
		"meta.icon": "ico",
		"meta.label": "Merkelapp",
		minOptionMessage: "Dette feltet krever minst 2 alternativer",
		name: "Navn",
		newOptionLabel: "Ny {type}",
		no: "Nei",
		number: "Nummer",
		off: "Av",
		on: "På",
		"operator.contains": "inneholder",
		"operator.equals": "er lik",
		"operator.notContains": "ikke inneholder",
		"operator.notEquals": "ikke lik",
		"operator.notVisible": "ikke synlig",
		"operator.visible": "synlig",
		option: "Alternativ",
		optional: "valgfri",
		optionEmpty: "Valgmulighet som kreves",
		optionLabel: "Alternativ {teller}",
		options: "alternativer",
		or: "eller",
		order: "Rekkefølge",
		"panel.label.attrs": "Egenskaper",
		"panel.label.conditions": "Forhold",
		"panel.label.config": "konfigurasjon",
		"panel.label.meta": "Meta",
		"panel.label.options": "alternativer",
		"panelEditButtons.attrs": "+ Attributt",
		"panelEditButtons.conditions": "+ Tilstand",
		"panelEditButtons.config": "+ Konfigurasjon",
		"panelEditButtons.options": "+ Alternativ",
		placeholder: "Plassholder",
		"placeholder.className": "mellomrom separerte klasser",
		"placeholder.email": "Skriv inn e-post",
		"placeholder.label": "Merkelapp",
		"placeholder.password": "Skriv inn passordet ditt",
		"placeholder.placeholder": "Plassholder",
		"placeholder.text": "Skriv inn litt tekst",
		"placeholder.textarea": "Skriv inn mye tekst",
		"placeholder.value": "Verdi",
		preview: "Forhåndsvisning",
		primary: "primær~~POS=TRUNC",
		remove: "Fjerne",
		removeMessage: "Fjern elementet",
		removeType: "Fjern {type}",
		required: "Må",
		reset: "tilbakestille",
		richText: "Rich Text Editor",
		roles: "Adgang",
		row: "Rad",
		"row.makeInputGroup": "Gjør denne raden en inngangsgruppe.",
		"row.makeInputGroupDesc": "Inngangsgrupper lar brukerne legge til sett med innspillinger om gangen.",
		"row.settings.fieldsetWrap": "Wrap rad i en & lt; fieldset & gt; stikkord",
		"row.settings.fieldsetWrap.aria": "Wrap Row i Fieldset",
		save: "Lagre",
		secondary: "sekundær",
		select: "Å velge",
		selectColor: "Velg Farge",
		selectionsMessage: "Tillat flere valg",
		selectOptions: "alternativer",
		separator: "separator",
		settings: "innstillinger",
		size: "Størrelse",
		sizes: "størrelser",
		"sizes.lg": "Stor",
		"sizes.m": "Misligholde",
		"sizes.sm": "Liten",
		"sizes.xs": "Ekstra liten",
		style: "Stil",
		styles: "Styles",
		"styles.btn": "Knapp stil",
		"styles.btn.danger": "Fare",
		"styles.btn.default": "Misligholde",
		"styles.btn.info": "info",
		"styles.btn.primary": "primær~~POS=TRUNC",
		"styles.btn.success": "Suksess",
		"styles.btn.warning": "Advarsel",
		subtype: "Type",
		success: "Suksess",
		text: "Tekstfelt",
		then: "Deretter",
		"then.condition.target.placeholder": "mål",
		toggle: "Veksle",
		ungrouped: "A-Gruppert",
		warning: "Advarsel",
		yes: "Ja"
	},
	"pl-PL": {
		"pl-PL": "polski (Polska)",
		dir: "ltr",
		"en-US": "język angielski",
		"af-ZA": "afrikaans (Republika Południowej Afryki)",
		"ar-TN": "arabski (Tunezja)",
		"cs-CZ": "czeski (Czechy)",
		"de-DE": "niemiecki (Niemcy)",
		"es-ES": "europejski hiszpański",
		"fa-IR": "perski (Iran)",
		"fi-FI": "fiński (Finlandia)",
		"fr-FR": "francuski (Francja)",
		"he-IL": "hebrajski (Izrael)",
		"hi-IN": "hindi (Indie)",
		"hu-HU": "węgierski (Węgry)",
		"it-IT": "włoski (Włochy)",
		"ja-JP": "japoński (Japonia)",
		"nb-NO": "norweski (bokmål) (Norwegia)",
		"pt-BR": "brazylijski portugalski",
		"pt-PT": "europejski portugalski",
		"ro-RO": "rumuński (Rumunia)",
		"ru-RU": "rosyjski (Rosja)",
		"th-TH": "tajski (Tajlandia)",
		"tr-TR": "turecki (Turcja)",
		"zh-CN": "chiński (Chiny)",
		"zh-HK": "chiński (SRA Hongkong [Chiny])",
		"action.add.attrs.attr": "Jaki atrybut chciałbyś dodać?",
		"action.add.attrs.value": "Domyślna wartość",
		addOption: "Dodaj opcję",
		allFieldsRemoved: "Wszystkie pola zostały usunięte.",
		allowSelect: "Zezwalaj Wybierz",
		and: "i",
		attribute: "Atrybut",
		attributeNotPermitted: "Atrybut \"{atrybut}\" jest niedozwolony, wybierz inny.",
		attributes: "Atrybuty",
		"attrs.class": "Klasa",
		"attrs.className": "Klasa",
		"attrs.dir": "Kierunek",
		"attrs.id": "ID",
		"attrs.required": "wymagany",
		"attrs.style": "Styl",
		"attrs.title": "Tytuł",
		"attrs.type": "Rodzaj",
		"attrs.value": "Wartość",
		autocomplete: "autouzupełnienie",
		button: "Przycisk",
		cancel: "Anulować",
		cannotBeEmpty: "To pole nie może być puste",
		cannotClearFields: "Nie ma pól do wyczyszczenia",
		checkbox: "Pole wyboru",
		checkboxes: "Checkboxes",
		class: "Klasa",
		clear: "Jasny",
		clearAllMessage: "Czy na pewno chcesz wyczyścić wszystkie pola?",
		close: "Blisko",
		column: "Kolumna",
		"condition.target.placeholder": "cel",
		"condition.type.and": "I",
		"condition.type.if": "Jeśli",
		"condition.type.or": "Lub",
		"condition.type.then": "Następnie",
		"condition.value.placeholder": "wartość",
		confirmClearAll: "Czy na pewno chcesz usunąć wszystkie pola?",
		content: "Zawartość",
		control: "Kontrola",
		"controlGroups.nextGroup": "Następna grupa",
		"controlGroups.prevGroup": "Poprzednia grupa",
		"controls.filteringTerm": "Filtrowanie \"{term}\"",
		"controls.form.button": "Przycisk",
		"controls.form.checkbox-group": "Grupa Checkbox",
		"controls.form.input.date": "Data",
		"controls.form.input.email": "E-mail",
		"controls.form.input.file": "Udostępnianie pliku",
		"controls.form.input.hidden": "Ukryte wejście",
		"controls.form.input.number": "Numer",
		"controls.form.input.text": "Wprowadzanie tekstu",
		"controls.form.radio-group": "Radio Group",
		"controls.form.select": "Wybierz",
		"controls.form.textarea": "TextArea",
		"controls.groups.form": "Pola formularzy",
		"controls.groups.html": "Elementy HTML",
		"controls.groups.layout": "Układ",
		"controls.html.divider": "Rozdzielacz",
		"controls.html.header": "nagłówek",
		"controls.html.paragraph": "Ustęp",
		"controls.layout.column": "Kolumna",
		"controls.layout.row": "Rząd",
		copy: "Skopiuj do schowka",
		danger: "Zagrożenie",
		defineColumnLayout: "Zdefiniuj układ kolumn",
		defineColumnWidths: "Określ szerokość kolumn",
		description: "Tekst pomocy",
		descriptionField: "Opis",
		"editing.row": "Edytowanie wiersza",
		editorTitle: "Formuj elementy",
		field: "Pole",
		"field.property.invalid": "nieważny",
		"field.property.isChecked": "jest sprawdzane",
		"field.property.isNotVisible": "nie jest widoczny",
		"field.property.isVisible": "jest widoczny",
		"field.property.label": "etykieta",
		"field.property.valid": "ważny",
		"field.property.value": "wartość",
		fieldNonEditable: "Tego pola nie można edytować.",
		fieldRemoveWarning: "Czy na pewno chcesz usunąć to pole?",
		fileUpload: "Udostępnianie pliku",
		formUpdated: "Formularz zaktualizowany",
		getStarted: "Przeciągnij pole od prawej, aby rozpocząć.",
		group: "Grupa",
		grouped: "Pogrupowane",
		hidden: "Ukryte wejście",
		hide: "Edytować",
		htmlElements: "Elementy HTML",
		if: "Jeśli",
		"if.condition.source.placeholder": "źródło",
		"if.condition.target.placeholder": "wartość docelowa",
		info: "Informacje",
		"input.date": "Data",
		"input.text": "Tekst",
		label: "Etykieta",
		labelCount: "{label} {count}",
		labelEmpty: "Etykieta pola nie może być pusta",
		"lang.af": "afrykanin",
		"lang.ar": "arabski",
		"lang.cs": "czeski",
		"lang.de": "niemiecki",
		"lang.en": "angielski",
		"lang.es": "hiszpański",
		"lang.fa": "perski",
		"lang.fi": "fiński",
		"lang.fr": "francuski",
		"lang.he": "hebrajski",
		"lang.hi": "hindi",
		"lang.hu": "węgierski",
		"lang.it": "włoski",
		"lang.ja": "japoński",
		"lang.nb": "Norweski bokmål",
		"lang.pl": "Polski",
		"lang.pt": "portugalski",
		"lang.ro": "rumuński",
		"lang.ru": "rosyjski",
		"lang.th": "tajski",
		"lang.tr": "turecki",
		"lang.zh": "chiński",
		layout: "Układ",
		limitRole: "Ogranicz dostęp do jednej lub więcej następujących ról:",
		mandatory: "Obowiązkowy",
		maxlength: "Maksymalna długość",
		"meta.group": "Grupa",
		"meta.icon": "I co",
		"meta.label": "Etykieta",
		minOptionMessage: "To pole wymaga co najmniej 2 opcji",
		name: "Imię",
		newOptionLabel: "Nowy typ}",
		no: "Nie",
		number: "Numer",
		off: "Poza",
		on: "Na",
		"operator.contains": "zawiera",
		"operator.equals": "równa się",
		"operator.notContains": "nie zawiera",
		"operator.notEquals": "nie równe",
		"operator.notVisible": "niewidoczny",
		"operator.visible": "widoczny",
		option: "Opcja",
		optional: "opcjonalny",
		optionEmpty: "Wymagana wartość opcji",
		optionLabel: "Opcja {count}",
		options: "Opcje",
		or: "lub",
		order: "Zamówienie",
		"panel.label.attrs": "Atrybuty",
		"panel.label.conditions": "Warunki",
		"panel.label.config": "Konfiguracja",
		"panel.label.meta": "Meta",
		"panel.label.options": "Opcje",
		"panelEditButtons.attrs": "+ Atrybut",
		"panelEditButtons.conditions": "+ Stan",
		"panelEditButtons.config": "+ Konfiguracja",
		"panelEditButtons.options": "+ Opcja",
		placeholder: "Symbol zastępczy",
		"placeholder.className": "klasy oddzielone spacjami",
		"placeholder.email": "Podaj e-mail",
		"placeholder.label": "Etykieta",
		"placeholder.password": "Wprowadź hasło",
		"placeholder.placeholder": "Symbol zastępczy",
		"placeholder.text": "Wprowadź trochę tekstu",
		"placeholder.textarea": "Wprowadź dużo tekstu",
		"placeholder.value": "Wartość",
		preview: "Zapowiedź",
		primary: "Podstawowa",
		remove: "Usunąć",
		removeMessage: "Usuń element",
		removeType: "Usuń {type}",
		required: "wymagany",
		reset: "Nastawić",
		richText: "Bogaty edytor tekstu",
		roles: "Dostęp",
		row: "Rząd",
		"row.makeInputGroup": "Ustaw ten wiersz jako grupę wejściową.",
		"row.makeInputGroupDesc": "Grupy wejściowe umożliwiają użytkownikom dodawanie zestawów wejść naraz.",
		"row.settings.fieldsetWrap": "Zwiń wiersz w & lt; fieldset & gt; etykietka",
		"row.settings.fieldsetWrap.aria": "Wrap Row in Fieldset",
		save: "Zapisać",
		secondary: "Wtórny",
		select: "Wybierz",
		selectColor: "Wybierz kolor",
		selectionsMessage: "Zezwalaj na wiele wyborów",
		selectOptions: "Opcje",
		separator: "Separator",
		settings: "Ustawienia",
		size: "Rozmiar",
		sizes: "Rozmiary",
		"sizes.lg": "Duży",
		"sizes.m": "Domyślna",
		"sizes.sm": "Mały",
		"sizes.xs": "Bardzo mały",
		style: "Styl",
		styles: "Style",
		"styles.btn": "Styl przycisku",
		"styles.btn.danger": "Zagrożenie",
		"styles.btn.default": "Domyślna",
		"styles.btn.info": "Informacje",
		"styles.btn.primary": "Podstawowa",
		"styles.btn.success": "Powodzenie",
		"styles.btn.warning": "Ostrzeżenie",
		subtype: "Rodzaj",
		success: "Powodzenie",
		text: "Pole tekstowe",
		then: "Następnie",
		"then.condition.target.placeholder": "cel",
		toggle: "Przełącznik",
		ungrouped: "A-Zgrupowane",
		warning: "Ostrzeżenie",
		yes: "tak"
	},
	"pt-BR": {
		"pt-BR": "português (Brasil)",
		dir: "ltr",
		"en-US": "Inglês",
		"af-ZA": "africâner (África do Sul)",
		"ar-TN": "árabe (Tunísia)",
		"cs-CZ": "tcheco (Tchéquia)",
		"de-DE": "alemão (Alemanha)",
		"es-ES": "espanhol (Espanha)",
		"fa-IR": "persa (Irã)",
		"fi-FI": "finlandês (Finlândia)",
		"fr-FR": "francês (França)",
		"he-IL": "hebraico (Israel)",
		"hi-IN": "híndi (Índia)",
		"hu-HU": "húngaro (Hungria)",
		"it-IT": "italiano (Itália)",
		"ja-JP": "japonês (Japão)",
		"nb-NO": "bokmål norueguês (Noruega)",
		"pl-PL": "polonês (Polônia)",
		"pt-PT": "português (Portugal)",
		"ro-RO": "romeno (Romênia)",
		"ru-RU": "russo (Rússia)",
		"th-TH": "tailandês (Tailândia)",
		"tr-TR": "turco (Turquia)",
		"zh-CN": "chinês (China)",
		"zh-HK": "chinês (Hong Kong, RAE da China)",
		"action.add.attrs.attr": "Que atributo você gostaria de adicionar?",
		"action.add.attrs.value": "Valor Padrão",
		addOption: "Adicionar opção",
		allFieldsRemoved: "Todos os campos foram removidos.",
		allowSelect: "Permitir Selecionar",
		and: "e",
		attribute: "Atributo",
		attributeNotPermitted: "O atributo \"{attribute}\" não é permitido, escolha outro.",
		attributes: "Atributos",
		"attrs.class": "Aula",
		"attrs.className": "Aula",
		"attrs.dir": "Direção",
		"attrs.id": "Eu ia",
		"attrs.required": "Obrigatório",
		"attrs.style": "Estilo",
		"attrs.title": "Título",
		"attrs.type": "Tipo",
		"attrs.value": "Valor",
		autocomplete: "Preenchimento automático",
		button: "Botão",
		cancel: "Cancelar",
		cannotBeEmpty: "Este campo não pode estar vazio",
		cannotClearFields: "Não há campos para limpar",
		checkbox: "Caixa de seleção",
		checkboxes: "Caixas de seleção",
		class: "Aula",
		clear: "Claro",
		clearAllMessage: "Tem certeza de que deseja limpar todos os campos?",
		close: "Fechar",
		column: "Coluna",
		"condition.target.placeholder": "alvo",
		"condition.type.and": "E",
		"condition.type.if": "Se",
		"condition.type.or": "Ou",
		"condition.type.then": "Então",
		"condition.value.placeholder": "valor",
		confirmClearAll: "Tem certeza de que deseja remover todos os campos?",
		content: "Contente",
		control: "Controlar",
		"controlGroups.nextGroup": "Próximo Grupo",
		"controlGroups.prevGroup": "Grupo Anterior",
		"controls.filteringTerm": "Filtrando \"{term}\"",
		"controls.form.button": "Botão",
		"controls.form.checkbox-group": "Grupo de caixas de seleção",
		"controls.form.input.date": "Data",
		"controls.form.input.email": "E-mail",
		"controls.form.input.file": "Upload de arquivo",
		"controls.form.input.hidden": "Entrada Oculta",
		"controls.form.input.number": "Número",
		"controls.form.input.text": "Entrada de texto",
		"controls.form.radio-group": "Grupo de Rádio",
		"controls.form.select": "Selecione",
		"controls.form.textarea": "Área de texto",
		"controls.groups.form": "Campos de formulário",
		"controls.groups.html": "Elementos HTML",
		"controls.groups.layout": "Disposição",
		"controls.html.divider": "Divisor",
		"controls.html.header": "Cabeçalho",
		"controls.html.paragraph": "Parágrafo",
		"controls.layout.column": "Coluna",
		"controls.layout.row": "Linha",
		copy: "Copiar para a área de transferência",
		danger: "Perigo",
		defineColumnLayout: "Definir um layout de coluna",
		defineColumnWidths: "Definir larguras de colunas",
		description: "Texto de ajuda",
		descriptionField: "Descrição",
		"editing.row": "Linha de edição",
		editorTitle: "Elementos de formulário",
		field: "Campo",
		"field.property.invalid": "não é válido",
		"field.property.isChecked": "está verificado",
		"field.property.isNotVisible": "não é visível",
		"field.property.isVisible": "é visível",
		"field.property.label": "rótulo",
		"field.property.valid": "válido",
		"field.property.value": "valor",
		fieldNonEditable: "Este campo não pode ser editado.",
		fieldRemoveWarning: "Tem certeza de que deseja remover este campo?",
		fileUpload: "Upload de arquivo",
		formUpdated: "Formulário Atualizado",
		getStarted: "Arraste um campo da direita para começar.",
		group: "Grupo",
		grouped: "Agrupado",
		hidden: "Entrada Oculta",
		hide: "Editar",
		htmlElements: "Elementos HTML",
		if: "Se",
		"if.condition.source.placeholder": "fonte",
		"if.condition.target.placeholder": "alvo / valor",
		info: "Informações",
		"input.date": "Data",
		"input.text": "Texto",
		label: "Rótulo",
		labelCount: "{rótulo} {contagem}",
		labelEmpty: "O rótulo do campo não pode estar vazio",
		"lang.af": "africano",
		"lang.ar": "árabe",
		"lang.cs": "Checo",
		"lang.de": "Alemão",
		"lang.en": "Inglês",
		"lang.es": "Espanhol",
		"lang.fa": "persa",
		"lang.fi": "finlandês",
		"lang.fr": "Francês",
		"lang.he": "hebraico",
		"lang.hi": "híndi",
		"lang.hu": "húngaro",
		"lang.it": "italiano",
		"lang.ja": "japonês",
		"lang.nb": "Bokmål Norueguês",
		"lang.pl": "polonês",
		"lang.pt": "Português",
		"lang.ro": "romeno",
		"lang.ru": "russo",
		"lang.th": "tailandês",
		"lang.tr": "turco",
		"lang.zh": "chinês",
		layout: "Disposição",
		limitRole: "Limite o acesso a uma ou mais das seguintes funções:",
		mandatory: "Obrigatório",
		maxlength: "Comprimento máximo",
		"meta.group": "Grupo",
		"meta.icon": "Icó",
		"meta.label": "Rótulo",
		minOptionMessage: "Este campo requer um mínimo de 2 opções",
		name: "Nome",
		newOptionLabel: "Novo {tipo}",
		no: "Não",
		number: "Número",
		off: "Desligado",
		on: "Sobre",
		"operator.contains": "contém",
		"operator.equals": "é igual a",
		"operator.notContains": "não contém",
		"operator.notEquals": "não é igual",
		"operator.notVisible": "não visível",
		"operator.visible": "visível",
		option: "Opção",
		optional: "opcional",
		optionEmpty: "Valor da opção necessário",
		optionLabel: "Opção {count}",
		options: "Opções",
		or: "ou",
		order: "Ordem",
		"panel.label.attrs": "Atributos",
		"panel.label.conditions": "Condições",
		"panel.label.config": "Configuração",
		"panel.label.meta": "Meta",
		"panel.label.options": "Opções",
		"panelEditButtons.attrs": "+ Atributo",
		"panelEditButtons.conditions": "+ Condição",
		"panelEditButtons.config": "+ Configuração",
		"panelEditButtons.options": "+ Opção",
		placeholder: "Espaço reservado",
		"placeholder.className": "classes separadas por espaço",
		"placeholder.email": "Digite seu e-mail",
		"placeholder.label": "Rótulo",
		"placeholder.password": "Digite sua senha",
		"placeholder.placeholder": "Espaço reservado",
		"placeholder.text": "Insira algum texto",
		"placeholder.textarea": "Insira muito texto",
		"placeholder.value": "Valor",
		preview: "Pré-visualização",
		primary: "Primário",
		remove: "Remover",
		removeMessage: "Remover Elemento",
		removeType: "Remover {tipo}",
		required: "Obrigatório",
		reset: "Reiniciar",
		richText: "Editor de texto rico",
		roles: "Acesso",
		row: "Linha",
		"row.makeInputGroup": "Faça desta linha um grupo de entrada.",
		"row.makeInputGroupDesc": "Grupos de entrada permitem que os usuários adicionem conjuntos de entradas por vez.",
		"row.settings.fieldsetWrap": "Quebrar linha em uma tag &lt;fieldset&gt;",
		"row.settings.fieldsetWrap.aria": "Quebrar linha em Fieldset",
		save: "Salvar",
		secondary: "Secundário",
		select: "Selecione",
		selectColor: "Selecione a cor",
		selectionsMessage: "Permitir Seleções Múltiplas",
		selectOptions: "Opções",
		separator: "Separador",
		settings: "Configurações",
		size: "Tamanho",
		sizes: "Tamanhos",
		"sizes.lg": "Grande",
		"sizes.m": "Padrão",
		"sizes.sm": "Pequeno",
		"sizes.xs": "Extra pequeno",
		style: "Estilo",
		styles: "Estilos",
		"styles.btn": "Estilo de botão",
		"styles.btn.danger": "Perigo",
		"styles.btn.default": "Padrão",
		"styles.btn.info": "Informações",
		"styles.btn.primary": "Primário",
		"styles.btn.success": "Sucesso",
		"styles.btn.warning": "Aviso",
		subtype: "Tipo",
		success: "Sucesso",
		text: "Campo de texto",
		then: "Então",
		"then.condition.target.placeholder": "alvo",
		toggle: "Alternar",
		ungrouped: "Desagrupado",
		warning: "Aviso",
		yes: "Sim"
	},
	"pt-PT": {
		"pt-PT": "português europeu",
		dir: "ltr",
		"en-US": "Inglês",
		"af-ZA": "africanês (África do Sul)",
		"ar-TN": "árabe (Tunísia)",
		"cs-CZ": "checo (Chéquia)",
		"de-DE": "alemão (Alemanha)",
		"es-ES": "espanhol europeu",
		"fa-IR": "persa (Irão)",
		"fi-FI": "finlandês (Finlândia)",
		"fr-FR": "francês (França)",
		"he-IL": "hebraico (Israel)",
		"hi-IN": "hindi (Índia)",
		"hu-HU": "húngaro (Hungria)",
		"it-IT": "italiano (Itália)",
		"ja-JP": "japonês (Japão)",
		"nb-NO": "norueguês bokmål (Noruega)",
		"pl-PL": "polaco (Polónia)",
		"pt-BR": "português do Brasil",
		"ro-RO": "romeno (Roménia)",
		"ru-RU": "russo (Rússia)",
		"th-TH": "tailandês (Tailândia)",
		"tr-TR": "turco (Turquia)",
		"zh-CN": "chinês (China)",
		"zh-HK": "chinês (Hong Kong, RAE da China)",
		"action.add.attrs.attr": "Que atributo você gostaria de adicionar?",
		"action.add.attrs.value": "Valor Padrão",
		addOption: "Adicionar opção",
		allFieldsRemoved: "Todos os campos foram removidos.",
		allowSelect: "Permitir Selecionar",
		and: "e",
		attribute: "Atributo",
		attributeNotPermitted: "O atributo \"{attribute}\" não é permitido, escolha outro.",
		attributes: "Atributos",
		"attrs.class": "Aula",
		"attrs.className": "Aula",
		"attrs.dir": "Direção",
		"attrs.id": "Eu ia",
		"attrs.required": "Obrigatório",
		"attrs.style": "Estilo",
		"attrs.title": "Título",
		"attrs.type": "Tipo",
		"attrs.value": "Valor",
		autocomplete: "Preenchimento automático",
		button: "Botão",
		cancel: "Cancelar",
		cannotBeEmpty: "Este campo não pode estar vazio",
		cannotClearFields: "Não há campos para limpar",
		checkbox: "Caixa de seleção",
		checkboxes: "Caixas de seleção",
		class: "Aula",
		clear: "Claro",
		clearAllMessage: "Tem certeza de que deseja limpar todos os campos?",
		close: "Fechar",
		column: "Coluna",
		"condition.target.placeholder": "alvo",
		"condition.type.and": "E",
		"condition.type.if": "Se",
		"condition.type.or": "Ou",
		"condition.type.then": "Então",
		"condition.value.placeholder": "valor",
		confirmClearAll: "Tem certeza de que deseja remover todos os campos?",
		content: "Contente",
		control: "Controlar",
		"controlGroups.nextGroup": "Próximo Grupo",
		"controlGroups.prevGroup": "Grupo Anterior",
		"controls.filteringTerm": "Filtrando \"{term}\"",
		"controls.form.button": "Botão",
		"controls.form.checkbox-group": "Grupo de caixas de seleção",
		"controls.form.input.date": "Data",
		"controls.form.input.email": "E-mail",
		"controls.form.input.file": "Upload de arquivo",
		"controls.form.input.hidden": "Entrada Oculta",
		"controls.form.input.number": "Número",
		"controls.form.input.text": "Entrada de texto",
		"controls.form.radio-group": "Grupo de Rádio",
		"controls.form.select": "Selecione",
		"controls.form.textarea": "Área de texto",
		"controls.groups.form": "Campos de formulário",
		"controls.groups.html": "Elementos HTML",
		"controls.groups.layout": "Disposição",
		"controls.html.divider": "Divisor",
		"controls.html.header": "Cabeçalho",
		"controls.html.paragraph": "Parágrafo",
		"controls.layout.column": "Coluna",
		"controls.layout.row": "Linha",
		copy: "Copiar para a área de transferência",
		danger: "Perigo",
		defineColumnLayout: "Definir um layout de coluna",
		defineColumnWidths: "Definir larguras de colunas",
		description: "Texto de ajuda",
		descriptionField: "Descrição",
		"editing.row": "Linha de edição",
		editorTitle: "Elementos de formulário",
		field: "Campo",
		"field.property.invalid": "não é válido",
		"field.property.isChecked": "está verificado",
		"field.property.isNotVisible": "não é visível",
		"field.property.isVisible": "é visível",
		"field.property.label": "rótulo",
		"field.property.valid": "válido",
		"field.property.value": "valor",
		fieldNonEditable: "Este campo não pode ser editado.",
		fieldRemoveWarning: "Tem certeza de que deseja remover este campo?",
		fileUpload: "Upload de arquivo",
		formUpdated: "Formulário Atualizado",
		getStarted: "Arraste um campo da direita para começar.",
		group: "Grupo",
		grouped: "Agrupado",
		hidden: "Entrada Oculta",
		hide: "Editar",
		htmlElements: "Elementos HTML",
		if: "Se",
		"if.condition.source.placeholder": "fonte",
		"if.condition.target.placeholder": "alvo / valor",
		info: "Informações",
		"input.date": "Data",
		"input.text": "Texto",
		label: "Rótulo",
		labelCount: "{rótulo} {contagem}",
		labelEmpty: "O rótulo do campo não pode estar vazio",
		"lang.af": "africano",
		"lang.ar": "árabe",
		"lang.cs": "Checo",
		"lang.de": "Alemão",
		"lang.en": "Inglês",
		"lang.es": "Espanhol",
		"lang.fa": "persa",
		"lang.fi": "finlandês",
		"lang.fr": "Francês",
		"lang.he": "hebraico",
		"lang.hi": "hindi",
		"lang.hu": "húngaro",
		"lang.it": "italiano",
		"lang.ja": "japonês",
		"lang.nb": "Bokmål Norueguês",
		"lang.pl": "polonês",
		"lang.pt": "Português",
		"lang.ro": "romeno",
		"lang.ru": "russo",
		"lang.th": "tailandês",
		"lang.tr": "turco",
		"lang.zh": "chinês",
		layout: "Disposição",
		limitRole: "Limite o acesso a uma ou mais das seguintes funções:",
		mandatory: "Obrigatório",
		maxlength: "Comprimento máximo",
		"meta.group": "Grupo",
		"meta.icon": "Icó",
		"meta.label": "Rótulo",
		minOptionMessage: "Este campo requer um mínimo de 2 opções",
		name: "Nome",
		newOptionLabel: "Novo {tipo}",
		no: "Não",
		number: "Número",
		off: "Desligado",
		on: "Sobre",
		"operator.contains": "contém",
		"operator.equals": "é igual a",
		"operator.notContains": "não contém",
		"operator.notEquals": "não é igual",
		"operator.notVisible": "não visível",
		"operator.visible": "visível",
		option: "Opção",
		optional: "opcional",
		optionEmpty: "Valor da opção necessário",
		optionLabel: "Opção {count}",
		options: "Opções",
		or: "ou",
		order: "Ordem",
		"panel.label.attrs": "Atributos",
		"panel.label.conditions": "Condições",
		"panel.label.config": "Configuração",
		"panel.label.meta": "Meta",
		"panel.label.options": "Opções",
		"panelEditButtons.attrs": "+ Atributo",
		"panelEditButtons.conditions": "+ Condição",
		"panelEditButtons.config": "+ Configuração",
		"panelEditButtons.options": "+ Opção",
		placeholder: "Espaço reservado",
		"placeholder.className": "classes separadas por espaço",
		"placeholder.email": "Digite seu e-mail",
		"placeholder.label": "Rótulo",
		"placeholder.password": "Digite sua senha",
		"placeholder.placeholder": "Espaço reservado",
		"placeholder.text": "Insira algum texto",
		"placeholder.textarea": "Insira muito texto",
		"placeholder.value": "Valor",
		preview: "Pré-visualização",
		primary: "Primário",
		remove: "Remover",
		removeMessage: "Remover Elemento",
		removeType: "Remover {tipo}",
		required: "Obrigatório",
		reset: "Reiniciar",
		richText: "Editor de texto rico",
		roles: "Acesso",
		row: "Linha",
		"row.makeInputGroup": "Faça desta linha um grupo de entrada.",
		"row.makeInputGroupDesc": "Grupos de entrada permitem que os usuários adicionem conjuntos de entradas por vez.",
		"row.settings.fieldsetWrap": "Quebrar linha em uma tag &lt;fieldset&gt;",
		"row.settings.fieldsetWrap.aria": "Quebrar linha em Fieldset",
		save: "Salvar",
		secondary: "Secundário",
		select: "Selecione",
		selectColor: "Selecione a cor",
		selectionsMessage: "Permitir Seleções Múltiplas",
		selectOptions: "Opções",
		separator: "Separador",
		settings: "Configurações",
		size: "Tamanho",
		sizes: "Tamanhos",
		"sizes.lg": "Grande",
		"sizes.m": "Padrão",
		"sizes.sm": "Pequeno",
		"sizes.xs": "Extra pequeno",
		style: "Estilo",
		styles: "Estilos",
		"styles.btn": "Estilo de botão",
		"styles.btn.danger": "Perigo",
		"styles.btn.default": "Padrão",
		"styles.btn.info": "Informações",
		"styles.btn.primary": "Primário",
		"styles.btn.success": "Sucesso",
		"styles.btn.warning": "Aviso",
		subtype: "Tipo",
		success: "Sucesso",
		text: "Campo de texto",
		then: "Então",
		"then.condition.target.placeholder": "alvo",
		toggle: "Alternar",
		ungrouped: "Desagrupado",
		warning: "Aviso",
		yes: "Sim"
	},
	"ro-RO": {
		"ro-RO": "română (România)",
		dir: "ltr",
		"en-US": "Engleză",
		"af-ZA": "afrikaans (Africa de Sud)",
		"ar-TN": "arabă (Tunisia)",
		"cs-CZ": "cehă (Cehia)",
		"de-DE": "germană (Germania)",
		"es-ES": "spaniolă (Europa)",
		"fa-IR": "persană (Iran)",
		"fi-FI": "finlandeză (Finlanda)",
		"fr-FR": "franceză (Franța)",
		"he-IL": "ebraică (Israel)",
		"hi-IN": "hindi (India)",
		"hu-HU": "maghiară (Ungaria)",
		"it-IT": "italiană (Italia)",
		"ja-JP": "japoneză (Japonia)",
		"nb-NO": "norvegiană bokmål (Norvegia)",
		"pl-PL": "poloneză (Polonia)",
		"pt-BR": "portugheză (Brazilia)",
		"pt-PT": "portugheză (Europa)",
		"ru-RU": "rusă (Rusia)",
		"th-TH": "thailandeză (Thailanda)",
		"tr-TR": "turcă (Turcia)",
		"zh-CN": "chineză (China)",
		"zh-HK": "chineză (R.A.S. Hong Kong, China)",
		"action.add.attrs.attr": "Ce atribut ați dori să adăugați?",
		"action.add.attrs.value": "Valoare implicită",
		addOption: "Adăugați opțiunea",
		allFieldsRemoved: "Toate câmpurile au fost eliminate.",
		allowSelect: "Permiteți selectarea",
		and: "și",
		attribute: "Atribut",
		attributeNotPermitted: "Atributul \"{atribut}\" nu este permis, vă rugăm să alegeți altul.",
		attributes: "atribute",
		"attrs.class": "Clasă",
		"attrs.className": "Clasă",
		"attrs.dir": "Direcţie",
		"attrs.id": "id-ul",
		"attrs.required": "Necesar",
		"attrs.style": "Stil",
		"attrs.title": "Titlu",
		"attrs.type": "Tip",
		"attrs.value": "Valoare",
		autocomplete: "Completare automată",
		button: "Buton",
		cancel: "Anula",
		cannotBeEmpty: "Acest câmp nu poate fi gol",
		cannotClearFields: "Nu există câmpuri pentru a șterge",
		checkbox: "Caseta de bifat",
		checkboxes: "Casetele de selectare",
		class: "Clasă",
		clear: "clar",
		clearAllMessage: "Sigur doriți să ștergeți toate câmpurile?",
		close: "Închide",
		column: "Coloană",
		"condition.target.placeholder": "ţintă",
		"condition.type.and": "Şi",
		"condition.type.if": "Dacă",
		"condition.type.or": "Sau",
		"condition.type.then": "Apoi",
		"condition.value.placeholder": "valoare",
		confirmClearAll: "Sigur doriți să eliminați toate câmpurile?",
		content: "Conţinut",
		control: "Control",
		"controlGroups.nextGroup": "Grupul următor",
		"controlGroups.prevGroup": "Grupul anterior",
		"controls.filteringTerm": "Filtrarea \"{term}\"",
		"controls.form.button": "Buton",
		"controls.form.checkbox-group": "Grupul de verificare",
		"controls.form.input.date": "Data",
		"controls.form.input.email": "E-mail",
		"controls.form.input.file": "Fișier încărcat",
		"controls.form.input.hidden": "Intrare ascunsă",
		"controls.form.input.number": "Număr",
		"controls.form.input.text": "Introducerea textului",
		"controls.form.radio-group": "Radio Group",
		"controls.form.select": "Selectați",
		"controls.form.textarea": "TextArea",
		"controls.groups.form": "Câmpuri de formular",
		"controls.groups.html": "Elementele HTML",
		"controls.groups.layout": "schemă",
		"controls.html.divider": "compas",
		"controls.html.header": "Antet",
		"controls.html.paragraph": "Paragraf",
		"controls.layout.column": "Coloană",
		"controls.layout.row": "Rând",
		copy: "Copiați în clipboard",
		danger: "Pericol",
		defineColumnLayout: "Definiți un aspect al coloanei",
		defineColumnWidths: "Definiți lățimea coloanelor",
		description: "Ajutați textul",
		descriptionField: "Descriere",
		"editing.row": "Editare rând",
		editorTitle: "Elemente formale",
		field: "Camp",
		"field.property.invalid": "invalid",
		"field.property.isChecked": "este verificat",
		"field.property.isNotVisible": "nu este vizibilă",
		"field.property.isVisible": "este vizibil",
		"field.property.label": "eticheta",
		"field.property.valid": "valabil",
		"field.property.value": "valoare",
		fieldNonEditable: "Acest câmp nu poate fi editat.",
		fieldRemoveWarning: "Sigur doriți să eliminați acest câmp?",
		fileUpload: "Fișier încărcat",
		formUpdated: "Formular actualizat",
		getStarted: "Glisați un câmp din dreapta pentru a începe.",
		group: "grup",
		grouped: "grupate",
		hidden: "Intrare ascunsă",
		hide: "Editați | ×",
		htmlElements: "Elementele HTML",
		if: "Dacă",
		"if.condition.source.placeholder": "sursă",
		"if.condition.target.placeholder": "țintă / valoare",
		info: "Info",
		"input.date": "Data",
		"input.text": "Text",
		label: "Eticheta",
		labelCount: "{label} {count}",
		labelEmpty: "Eticheta de câmp nu poate fi goală",
		"lang.af": "african",
		"lang.ar": "arabic",
		"lang.cs": "ceh",
		"lang.de": "german",
		"lang.en": "engleză",
		"lang.es": "spaniolă",
		"lang.fa": "persană",
		"lang.fi": "finlandeză",
		"lang.fr": "franceză",
		"lang.he": "ebraică",
		"lang.hi": "hindi",
		"lang.hu": "maghiară",
		"lang.it": "italian",
		"lang.ja": "japonez",
		"lang.nb": "norvegiana bokmål",
		"lang.pl": "Lustrui",
		"lang.pt": "portugheză",
		"lang.ro": "română",
		"lang.ru": "rusă",
		"lang.th": "thailandez",
		"lang.tr": "turc",
		"lang.zh": "chinez",
		layout: "schemă",
		limitRole: "Limitați accesul la unul sau mai multe dintre următoarele roluri:",
		mandatory: "Obligatoriu",
		maxlength: "Lungime maxima",
		"meta.group": "grup",
		"meta.icon": "Ico",
		"meta.label": "Eticheta",
		minOptionMessage: "Acest câmp necesită minim 2 opțiuni",
		name: "Nume",
		newOptionLabel: "Tip nou}",
		no: "Nu",
		number: "Număr",
		off: "de pe",
		on: "Pe",
		"operator.contains": "conține",
		"operator.equals": "este egală",
		"operator.notContains": "nu conține",
		"operator.notEquals": "nu este egal",
		"operator.notVisible": "nu este vizibil",
		"operator.visible": "vizibil",
		option: "Opțiune",
		optional: "facultativ",
		optionEmpty: "Valoarea opțiunii necesară",
		optionLabel: "Opțiunea {count}",
		options: "Opțiuni",
		or: "sau",
		order: "Ordin",
		"panel.label.attrs": "atribute",
		"panel.label.conditions": "Condiții",
		"panel.label.config": "configurație",
		"panel.label.meta": "Meta",
		"panel.label.options": "Opțiuni",
		"panelEditButtons.attrs": "+ Atribut",
		"panelEditButtons.conditions": "+ Condiție",
		"panelEditButtons.config": "+ Configurare",
		"panelEditButtons.options": "+ Opțiune",
		placeholder: "Substitut",
		"placeholder.className": "spații separate",
		"placeholder.email": "Introdu adresa de email",
		"placeholder.label": "Eticheta",
		"placeholder.password": "Introduceți parola",
		"placeholder.placeholder": "Substitut",
		"placeholder.text": "Introduceți un text",
		"placeholder.textarea": "Introduceți o mulțime de text",
		"placeholder.value": "Valoare",
		preview: "previzualizare",
		primary: "Primar",
		remove: "Elimina",
		removeMessage: "Eliminați elementul",
		removeType: "Eliminați {type}",
		required: "Necesar",
		reset: "restabili",
		richText: "Editor text îmbogățit",
		roles: "Acces",
		row: "Rând",
		"row.makeInputGroup": "Faceți acest rând un grup de intrare.",
		"row.makeInputGroupDesc": "Grupurile de intrare permit utilizatorilor să adauge seturi de intrări la un moment dat.",
		"row.settings.fieldsetWrap": "Înfășurați rândul într-un & lt; fieldset & gt; etichetă",
		"row.settings.fieldsetWrap.aria": "Wrap Row in Fieldset",
		save: "Salvați",
		secondary: "Secundar",
		select: "Selectați",
		selectColor: "Selectați Culoare",
		selectionsMessage: "Permiteți mai multe selecții",
		selectOptions: "Opțiuni",
		separator: "Separator",
		settings: "Setări",
		size: "mărimea",
		sizes: "Dimensiuni",
		"sizes.lg": "Mare",
		"sizes.m": "Mod implicit",
		"sizes.sm": "Mic",
		"sizes.xs": "Extra mic",
		style: "Stil",
		styles: "stiluri",
		"styles.btn": "Butonul de stil",
		"styles.btn.danger": "Pericol",
		"styles.btn.default": "Mod implicit",
		"styles.btn.info": "Info",
		"styles.btn.primary": "Primar",
		"styles.btn.success": "Succes",
		"styles.btn.warning": "Avertizare",
		subtype: "Tip",
		success: "Succes",
		text: "Câmp de text",
		then: "Atunci",
		"then.condition.target.placeholder": "ţintă",
		toggle: "Comutare",
		ungrouped: "A-Grupate",
		warning: "Avertizare",
		yes: "da"
	},
	"ru-RU": {
		"ru-RU": "русский (Россия)",
		dir: "ltr",
		"en-US": "английский",
		"af-ZA": "африкаанс (Южно-Африканская Республика)",
		"ar-TN": "арабский (Тунис)",
		"cs-CZ": "чешский (Чехия)",
		"de-DE": "немецкий (Германия)",
		"es-ES": "европейский испанский",
		"fa-IR": "персидский (Иран)",
		"fi-FI": "финский (Финляндия)",
		"fr-FR": "французский (Франция)",
		"he-IL": "иврит (Израиль)",
		"hi-IN": "хинди (Индия)",
		"hu-HU": "венгерский (Венгрия)",
		"it-IT": "итальянский (Италия)",
		"ja-JP": "японский (Япония)",
		"nb-NO": "норвежский букмол (Норвегия)",
		"pl-PL": "польский (Польша)",
		"pt-BR": "бразильский португальский",
		"pt-PT": "европейский португальский",
		"ro-RO": "румынский (Румыния)",
		"th-TH": "тайский (Таиланд)",
		"tr-TR": "турецкий (Турция)",
		"zh-CN": "китайский (Китай)",
		"zh-HK": "китайский (Гонконг [САР])",
		"action.add.attrs.attr": "Какой атрибут вы хотели бы добавить?",
		"action.add.attrs.value": "Значение по умолчанию",
		addOption: "Добавить опцию",
		allFieldsRemoved: "Все поля были удалены.",
		allowSelect: "Разрешить выбор",
		and: "а также",
		attribute: "атрибут",
		attributeNotPermitted: "Атрибут «{attribute}» не разрешен, выберите другой.",
		attributes: "Атрибуты",
		"attrs.class": "Учебный класс",
		"attrs.className": "Учебный класс",
		"attrs.dir": "направление",
		"attrs.id": "Я бы",
		"attrs.required": "необходимые",
		"attrs.style": "Стиль",
		"attrs.title": "заглавие",
		"attrs.type": "Тип",
		"attrs.value": "Значение",
		autocomplete: "Автозаполнение",
		button: "кнопка",
		cancel: "Отмена",
		cannotBeEmpty: "Это поле не может быть пустым",
		cannotClearFields: "Нет полей для очистки",
		checkbox: "флажок",
		checkboxes: "Флажки",
		class: "Учебный класс",
		clear: "Очистить",
		clearAllMessage: "Вы уверены, что хотите очистить все поля?",
		close: "близко",
		column: "колонка",
		"condition.target.placeholder": "цель",
		"condition.type.and": "И",
		"condition.type.if": "Если",
		"condition.type.or": "Или",
		"condition.type.then": "Затем",
		"condition.value.placeholder": "значение",
		confirmClearAll: "Вы действительно хотите удалить все поля?",
		content: "содержание",
		control: "контроль",
		"controlGroups.nextGroup": "Следующая группа",
		"controlGroups.prevGroup": "Предыдущая группа",
		"controls.filteringTerm": "Фильтрация \"{term}\"",
		"controls.form.button": "кнопка",
		"controls.form.checkbox-group": "Группа флажков",
		"controls.form.input.date": "Дата",
		"controls.form.input.email": "Эл. адрес",
		"controls.form.input.file": "Файл загружен",
		"controls.form.input.hidden": "Скрытый ввод",
		"controls.form.input.number": "Число",
		"controls.form.input.text": "Ввод текста",
		"controls.form.radio-group": "Радиогруппа",
		"controls.form.select": "Выбрать",
		"controls.form.textarea": "TextArea",
		"controls.groups.form": "Поля формы",
		"controls.groups.html": "Элементы HTML",
		"controls.groups.layout": "раскладка",
		"controls.html.divider": "делитель",
		"controls.html.header": "заголовок",
		"controls.html.paragraph": "Параграф",
		"controls.layout.column": "колонка",
		"controls.layout.row": "Строка",
		copy: "Скопировать в буфер обмена",
		danger: "Опасность",
		defineColumnLayout: "Определение расположения столбца",
		defineColumnWidths: "Определение ширины столбцов",
		description: "Текст справки",
		descriptionField: "Описание",
		"editing.row": "Редактирование строки",
		editorTitle: "Элементы формы",
		field: "поле",
		"field.property.invalid": "недействительный",
		"field.property.isChecked": "проверено",
		"field.property.isNotVisible": "не видно",
		"field.property.isVisible": "видно",
		"field.property.label": "этикетка",
		"field.property.valid": "действительный",
		"field.property.value": "значение",
		fieldNonEditable: "Это поле невозможно отредактировать.",
		fieldRemoveWarning: "Вы действительно хотите удалить это поле?",
		fileUpload: "Файл загружен",
		formUpdated: "Форма обновлена",
		getStarted: "Для начала перетащите поле справа.",
		group: "группа",
		grouped: "Сгруппированные",
		hidden: "Скрытый ввод",
		hide: "редактировать",
		htmlElements: "Элементы HTML",
		if: "Если",
		"if.condition.source.placeholder": "источник",
		"if.condition.target.placeholder": "целевое значение",
		info: "Информация",
		"input.date": "Дата",
		"input.text": "Текст",
		label: "этикетка",
		labelCount: "{label} {count}",
		labelEmpty: "Полевая метка не может быть пуста",
		"lang.af": "Африканский",
		"lang.ar": "арабский",
		"lang.cs": "чешский",
		"lang.de": "немецкий",
		"lang.en": "Английский",
		"lang.es": "испанский",
		"lang.fa": "персидский",
		"lang.fi": "финский",
		"lang.fr": "Французский",
		"lang.he": "иврит",
		"lang.hi": "хинди",
		"lang.hu": "венгерский",
		"lang.it": "итальянский",
		"lang.ja": "японский",
		"lang.nb": "Норвежский букмол",
		"lang.pl": "польский",
		"lang.pt": "португальский",
		"lang.ro": "румынский",
		"lang.ru": "Русский",
		"lang.th": "тайский",
		"lang.tr": "турецкий",
		"lang.zh": "китайский",
		layout: "раскладка",
		limitRole: "Ограничить доступ к одной или нескольким из следующих ролей:",
		mandatory: "Обязательный",
		maxlength: "Максимальная длина",
		"meta.group": "группа",
		"meta.icon": "Ico",
		"meta.label": "этикетка",
		minOptionMessage: "Для этого поля требуется минимум 2 варианта",
		name: "название",
		newOptionLabel: "Новый {type}",
		no: "нет",
		number: "Число",
		off: "от",
		on: "На",
		"operator.contains": "содержит",
		"operator.equals": "равняется",
		"operator.notContains": "не содержит",
		"operator.notEquals": "не равный",
		"operator.notVisible": "невидимый",
		"operator.visible": "видимый",
		option: "вариант",
		optional: "необязательный",
		optionEmpty: "Требуемое значение параметра",
		optionLabel: "Вариант {count}",
		options: "Опции",
		or: "или же",
		order: "порядок",
		"panel.label.attrs": "Атрибуты",
		"panel.label.conditions": "условия",
		"panel.label.config": "конфигурация",
		"panel.label.meta": "Мета",
		"panel.label.options": "Опции",
		"panelEditButtons.attrs": "+ Атрибут",
		"panelEditButtons.conditions": "+ Условие",
		"panelEditButtons.config": "+ Конфигурация",
		"panelEditButtons.options": "+ Вариант",
		placeholder: "Заполнитель",
		"placeholder.className": "классы, разделенные пробелами",
		"placeholder.email": "Введите адрес электронной почты",
		"placeholder.label": "этикетка",
		"placeholder.password": "Введите ваш пароль",
		"placeholder.placeholder": "Заполнитель",
		"placeholder.text": "Введите текст",
		"placeholder.textarea": "Введите много текста",
		"placeholder.value": "Значение",
		preview: "предварительный просмотр",
		primary: "первичный",
		remove: "Удалить",
		removeMessage: "Удалить элемент",
		removeType: "Удалить {type}",
		required: "необходимые",
		reset: "Сброс",
		richText: "Редактор Rich Text Editor",
		roles: "Доступ",
		row: "Строка",
		"row.makeInputGroup": "Сделайте эту строку группой ввода.",
		"row.makeInputGroupDesc": "Группы ввода позволяют пользователям добавлять наборы входов одновременно.",
		"row.settings.fieldsetWrap": "Wrap row в & lt; fieldset & gt; тег",
		"row.settings.fieldsetWrap.aria": "Wrap Row в Fieldset",
		save: "Сохранить",
		secondary: "второстепенный",
		select: "Выбрать",
		selectColor: "Выберите цвет",
		selectionsMessage: "Разрешить множественный выбор",
		selectOptions: "Опции",
		separator: "Разделитель",
		settings: "настройки",
		size: "Размер",
		sizes: "Размеры",
		"sizes.lg": "большой",
		"sizes.m": "По умолчанию",
		"sizes.sm": "Маленький",
		"sizes.xs": "Очень маленький",
		style: "Стиль",
		styles: "Стили",
		"styles.btn": "Стиль кнопки",
		"styles.btn.danger": "Опасность",
		"styles.btn.default": "По умолчанию",
		"styles.btn.info": "Информация",
		"styles.btn.primary": "первичный",
		"styles.btn.success": "успех",
		"styles.btn.warning": "Предупреждение",
		subtype: "Тип",
		success: "успех",
		text: "Текстовое поле",
		then: "затем",
		"then.condition.target.placeholder": "цель",
		toggle: "тумблер",
		ungrouped: "A-Сгруппированные",
		warning: "Предупреждение",
		yes: "да"
	},
	"th-TH": {
		"th-TH": "ไทย (ไทย)",
		dir: "ltr",
		"en-US": "ภาษาอังกฤษ",
		"af-ZA": "แอฟริกานส์ (แอฟริกาใต้)",
		"ar-TN": "อาหรับ (ตูนิเซีย)",
		"cs-CZ": "เช็ก (เช็ก)",
		"de-DE": "เยอรมัน (เยอรมนี)",
		"es-ES": "สเปน - ยุโรป",
		"fa-IR": "เปอร์เซีย (อิหร่าน)",
		"fi-FI": "ฟินแลนด์ (ฟินแลนด์)",
		"fr-FR": "ฝรั่งเศส (ฝรั่งเศส)",
		"he-IL": "ฮิบรู (อิสราเอล)",
		"hi-IN": "ฮินดี (อินเดีย)",
		"hu-HU": "ฮังการี (ฮังการี)",
		"it-IT": "อิตาลี (อิตาลี)",
		"ja-JP": "ญี่ปุ่น (ญี่ปุ่น)",
		"nb-NO": "นอร์เวย์บุคมอล (นอร์เวย์)",
		"pl-PL": "โปแลนด์ (โปแลนด์)",
		"pt-BR": "โปรตุเกส - บราซิล",
		"pt-PT": "โปรตุเกส - ยุโรป",
		"ro-RO": "โรมาเนีย (โรมาเนีย)",
		"ru-RU": "รัสเซีย (รัสเซีย)",
		"tr-TR": "ตุรกี (ตุรกี)",
		"zh-CN": "จีน (จีน)",
		"zh-HK": "จีน (เขตปกครองพิเศษฮ่องกงแห่งสาธารณรัฐประชาชนจีน)",
		"action.add.attrs.attr": "คุณต้องการเพิ่มคุณสมบัติใด?",
		"action.add.attrs.value": "ค่าเริ่มต้น",
		addOption: "เพิ่มตัวเลือก",
		allFieldsRemoved: "ลบข้อมูลทุกช่องออกแล้ว",
		allowSelect: "อนุญาตให้เลือก",
		and: "และ",
		attribute: "คุณลักษณะ",
		attributeNotPermitted: "ไม่อนุญาตให้ใช้แอตทริบิวต์ \"{attribute}\" โปรดเลือกแอตทริบิวต์อื่น",
		attributes: "คุณสมบัติ",
		"attrs.class": "ระดับ",
		"attrs.className": "ระดับ",
		"attrs.dir": "ทิศทาง",
		"attrs.id": "รหัส",
		"attrs.required": "ที่จำเป็น",
		"attrs.style": "สไตล์",
		"attrs.title": "ชื่อ",
		"attrs.type": "พิมพ์",
		"attrs.value": "ค่า",
		autocomplete: "การกรอกอัตโนมัติ",
		button: "ปุ่ม",
		cancel: "ยกเลิก",
		cannotBeEmpty: "ฟิลด์นี้ไม่สามารถว่างเปล่าได้",
		cannotClearFields: "ไม่มีช่องที่ต้องล้างข้อมูล",
		checkbox: "ช่องกาเครื่องหมาย",
		checkboxes: "ช่องกาเครื่องหมาย",
		class: "ระดับ",
		clear: "ชัดเจน",
		clearAllMessage: "คุณแน่ใจว่าต้องการล้างข้อมูลทั้งหมดหรือไม่?",
		close: "ปิด",
		column: "คอลัมน์",
		"condition.target.placeholder": "เป้า",
		"condition.type.and": "และ",
		"condition.type.if": "ถ้า",
		"condition.type.or": "หรือ",
		"condition.type.then": "แล้ว",
		"condition.value.placeholder": "ค่า",
		confirmClearAll: "คุณแน่ใจว่าต้องการลบข้อมูลทั้งหมดหรือไม่?",
		content: "เนื้อหา",
		control: "ควบคุม",
		"controlGroups.nextGroup": "กลุ่มถัดไป",
		"controlGroups.prevGroup": "กลุ่มก่อนหน้า",
		"controls.filteringTerm": "การกรอง \"{term}\"",
		"controls.form.button": "ปุ่ม",
		"controls.form.checkbox-group": "กลุ่มกล่องกาเครื่องหมาย",
		"controls.form.input.date": "วันที่",
		"controls.form.input.email": "อีเมล",
		"controls.form.input.file": "อัพโหลดไฟล์",
		"controls.form.input.hidden": "อินพุตที่ซ่อนอยู่",
		"controls.form.input.number": "ตัวเลข",
		"controls.form.input.text": "การป้อนข้อความ",
		"controls.form.radio-group": "กลุ่มวิทยุ",
		"controls.form.select": "เลือก",
		"controls.form.textarea": "พื้นที่ข้อความ",
		"controls.groups.form": "ฟิลด์ฟอร์ม",
		"controls.groups.html": "องค์ประกอบ HTML",
		"controls.groups.layout": "เค้าโครง",
		"controls.html.divider": "ตัวคั่น",
		"controls.html.header": "ส่วนหัว",
		"controls.html.paragraph": "ย่อหน้า",
		"controls.layout.column": "คอลัมน์",
		"controls.layout.row": "แถว",
		copy: "คัดลอกไปยังคลิปบอร์ด",
		danger: "อันตราย",
		defineColumnLayout: "กำหนดเค้าโครงคอลัมน์",
		defineColumnWidths: "กำหนดความกว้างของคอลัมน์",
		description: "ข้อความช่วยเหลือ",
		descriptionField: "คำอธิบาย",
		"editing.row": "การแก้ไขแถว",
		editorTitle: "องค์ประกอบแบบฟอร์ม",
		field: "สนาม",
		"field.property.invalid": "ไม่ถูกต้อง",
		"field.property.isChecked": "ได้รับการตรวจสอบแล้ว",
		"field.property.isNotVisible": "มองไม่เห็น",
		"field.property.isVisible": "สามารถมองเห็นได้",
		"field.property.label": "ฉลาก",
		"field.property.valid": "ถูกต้อง",
		"field.property.value": "ค่า",
		fieldNonEditable: "ไม่สามารถแก้ไขฟิลด์นี้ได้",
		fieldRemoveWarning: "คุณแน่ใจว่าต้องการลบฟิลด์นี้หรือไม่?",
		fileUpload: "อัพโหลดไฟล์",
		formUpdated: "แบบฟอร์มอัปเดต",
		getStarted: "ลากฟิลด์จากด้านขวาเพื่อเริ่มต้น",
		group: "กลุ่ม",
		grouped: "การจัดกลุ่ม",
		hidden: "อินพุตที่ซ่อนอยู่",
		hide: "แก้ไข",
		htmlElements: "องค์ประกอบ HTML",
		if: "ถ้า",
		"if.condition.source.placeholder": "แหล่งที่มา",
		"if.condition.target.placeholder": "เป้าหมาย / มูลค่า",
		info: "ข้อมูล",
		"input.date": "วันที่",
		"input.text": "ข้อความ",
		label: "ฉลาก",
		labelCount: "{ป้าย} {จำนวน}",
		labelEmpty: "ป้ายชื่อฟิลด์ไม่สามารถว่างเปล่าได้",
		"lang.af": "แอฟริกัน",
		"lang.ar": "ภาษาอาหรับ",
		"lang.cs": "เช็ก",
		"lang.de": "เยอรมัน",
		"lang.en": "ภาษาอังกฤษ",
		"lang.es": "สเปน",
		"lang.fa": "เปอร์เซีย",
		"lang.fi": "ฟินแลนด์",
		"lang.fr": "ภาษาฝรั่งเศส",
		"lang.he": "ฮิบรู",
		"lang.hi": "ฮินดี",
		"lang.hu": "ฮังการี",
		"lang.it": "อิตาลี",
		"lang.ja": "ญี่ปุ่น",
		"lang.nb": "นอร์เวย์บุคมอล",
		"lang.pl": "ขัด",
		"lang.pt": "โปรตุเกส",
		"lang.ro": "โรมาเนีย",
		"lang.ru": "รัสเซีย",
		"lang.th": "แบบไทย",
		"lang.tr": "ภาษาตุรกี",
		"lang.zh": "ชาวจีน",
		layout: "เค้าโครง",
		limitRole: "จำกัดการเข้าถึงหนึ่งหรือมากกว่าหนึ่งบทบาทต่อไปนี้:",
		mandatory: "บังคับ",
		maxlength: "ความยาวสูงสุด",
		"meta.group": "กลุ่ม",
		"meta.icon": "ไอโค",
		"meta.label": "ฉลาก",
		minOptionMessage: "ฟิลด์นี้จำเป็นต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก",
		name: "ชื่อ",
		newOptionLabel: "ใหม่ {ประเภท}",
		no: "เลขที่",
		number: "ตัวเลข",
		off: "ปิด",
		on: "บน",
		"operator.contains": "ประกอบด้วย",
		"operator.equals": "เท่ากับ",
		"operator.notContains": "ไม่ประกอบด้วย",
		"operator.notEquals": "ไม่เท่ากัน",
		"operator.notVisible": "มองไม่เห็น",
		"operator.visible": "มองเห็นได้",
		option: "ตัวเลือก",
		optional: "ไม่จำเป็น",
		optionEmpty: "ค่าตัวเลือกที่ต้องการ",
		optionLabel: "ตัวเลือก {จำนวน}",
		options: "ตัวเลือก",
		or: "หรือ",
		order: "คำสั่ง",
		"panel.label.attrs": "คุณสมบัติ",
		"panel.label.conditions": "เงื่อนไข",
		"panel.label.config": "การกำหนดค่า",
		"panel.label.meta": "เมต้า",
		"panel.label.options": "ตัวเลือก",
		"panelEditButtons.attrs": "+ คุณสมบัติ",
		"panelEditButtons.conditions": "+ สภาพ",
		"panelEditButtons.config": "+ การกำหนดค่า",
		"panelEditButtons.options": "+ ตัวเลือก",
		placeholder: "ตัวแทน",
		"placeholder.className": "การแบ่งชั้นเรียนแบบแยกพื้นที่",
		"placeholder.email": "กรอกอีเมล์ของคุณ",
		"placeholder.label": "ฉลาก",
		"placeholder.password": "กรอกรหัสผ่านของคุณ",
		"placeholder.placeholder": "ตัวแทน",
		"placeholder.text": "ป้อนข้อความบางอย่าง",
		"placeholder.textarea": "ใส่ข้อความจำนวนมาก",
		"placeholder.value": "ค่า",
		preview: "ตัวอย่าง",
		primary: "หลัก",
		remove: "ลบ",
		removeMessage: "ลบองค์ประกอบ",
		removeType: "ลบ {type}",
		required: "ที่จำเป็น",
		reset: "รีเซ็ต",
		richText: "โปรแกรมแก้ไขข้อความแบบ Rich Text",
		roles: "เข้าถึง",
		row: "แถว",
		"row.makeInputGroup": "สร้างแถวนี้เป็นกลุ่มอินพุต",
		"row.makeInputGroupDesc": "กลุ่มอินพุตช่วยให้ผู้ใช้สามารถเพิ่มชุดอินพุตได้ในแต่ละครั้ง",
		"row.settings.fieldsetWrap": "ห่อแถวในแท็ก &lt;fieldset&gt;",
		"row.settings.fieldsetWrap.aria": "การห่อแถวใน Fieldset",
		save: "บันทึก",
		secondary: "มัธยมศึกษาตอนปลาย",
		select: "เลือก",
		selectColor: "เลือกสี",
		selectionsMessage: "อนุญาตให้เลือกได้หลายรายการ",
		selectOptions: "ตัวเลือก",
		separator: "ตัวคั่น",
		settings: "การตั้งค่า",
		size: "ขนาด",
		sizes: "ขนาด",
		"sizes.lg": "ใหญ่",
		"sizes.m": "ค่าเริ่มต้น",
		"sizes.sm": "เล็ก",
		"sizes.xs": "พิเศษเล็ก",
		style: "สไตล์",
		styles: "สไตล์",
		"styles.btn": "รูปแบบปุ่ม",
		"styles.btn.danger": "อันตราย",
		"styles.btn.default": "ค่าเริ่มต้น",
		"styles.btn.info": "ข้อมูล",
		"styles.btn.primary": "หลัก",
		"styles.btn.success": "ความสำเร็จ",
		"styles.btn.warning": "คำเตือน",
		subtype: "พิมพ์",
		success: "ความสำเร็จ",
		text: "ช่องข้อความ",
		then: "แล้ว",
		"then.condition.target.placeholder": "เป้า",
		toggle: "สลับ",
		ungrouped: "ยกเลิกการจัดกลุ่ม",
		warning: "คำเตือน",
		yes: "ใช่"
	},
	"tr-TR": {
		"tr-TR": "Türkçe (Türkiye)",
		dir: "ltr",
		"en-US": "ingilizce",
		"af-ZA": "Afrikaanca (Güney Afrika)",
		"ar-TN": "Arapça (Tunus)",
		"cs-CZ": "Çekçe (Çekya)",
		"de-DE": "Almanca (Almanya)",
		"es-ES": "Avrupa İspanyolcası",
		"fa-IR": "Farsça (İran)",
		"fi-FI": "Fince (Finlandiya)",
		"fr-FR": "Fransızca (Fransa)",
		"he-IL": "İbranice (İsrail)",
		"hi-IN": "Hintçe (Hindistan)",
		"hu-HU": "Macarca (Macaristan)",
		"it-IT": "İtalyanca (İtalya)",
		"ja-JP": "Japonca (Japonya)",
		"nb-NO": "Norveççe Bokmål (Norveç)",
		"pl-PL": "Lehçe (Polonya)",
		"pt-BR": "Brezilya Portekizcesi",
		"pt-PT": "Avrupa Portekizcesi",
		"ro-RO": "Rumence (Romanya)",
		"ru-RU": "Rusça (Rusya)",
		"th-TH": "Tayca (Tayland)",
		"zh-CN": "Çince (Çin)",
		"zh-HK": "Çince (Çin Hong Kong ÖİB)",
		"action.add.attrs.attr": "Hangi özelliği eklemek istersiniz?",
		"action.add.attrs.value": "Varsayılan değer",
		addOption: "Seçenek ekle",
		allFieldsRemoved: "Tüm alanlar kaldırıldı.",
		allowSelect: "Seçime İzin Ver",
		and: "ve",
		attribute: "nitelik",
		attributeNotPermitted: "\"{Attribute}\" özelliğine izin verilmiyor, lütfen başka bir tane seçin.",
		attributes: "Öznitellikler",
		"attrs.class": "Sınıf",
		"attrs.className": "Sınıf",
		"attrs.dir": "yön",
		"attrs.id": "İD",
		"attrs.required": "gereklidir",
		"attrs.style": "stil",
		"attrs.title": "Başlık",
		"attrs.type": "tip",
		"attrs.value": "değer",
		autocomplete: "Otomatik tamamlama",
		button: "Buton",
		cancel: "İptal etmek",
		cannotBeEmpty: "Bu alan boş olamaz",
		cannotClearFields: "Temizlenecek alan yok",
		checkbox: "Onay Kutusu",
		checkboxes: "Onay kutuları",
		class: "Sınıf",
		clear: "Açık",
		clearAllMessage: "Tüm alanları temizlemek istediğinden emin misin?",
		close: "Kapat",
		column: "sütun",
		"condition.target.placeholder": "hedef",
		"condition.type.and": "Ve",
		"condition.type.if": "Eğer",
		"condition.type.or": "Veya",
		"condition.type.then": "Daha sonra",
		"condition.value.placeholder": "değer",
		confirmClearAll: "Tüm alanları kaldırmak istediğinizden emin misiniz?",
		content: "içerik",
		control: "Kontrol",
		"controlGroups.nextGroup": "Sonraki grup",
		"controlGroups.prevGroup": "Önceki Grup",
		"controls.filteringTerm": "\"{Term}\" filtrelemesi",
		"controls.form.button": "Buton",
		"controls.form.checkbox-group": "Onay Kutusu Grubu",
		"controls.form.input.date": "tarih",
		"controls.form.input.email": "E-posta",
		"controls.form.input.file": "Dosya yükleme",
		"controls.form.input.hidden": "Gizli Giriş",
		"controls.form.input.number": "Numara",
		"controls.form.input.text": "Metin Girişi",
		"controls.form.radio-group": "Radyo Grubu",
		"controls.form.select": "seçmek",
		"controls.form.textarea": "TextArea",
		"controls.groups.form": "Form Alanları",
		"controls.groups.html": "HTML Öğeleri",
		"controls.groups.layout": "düzen",
		"controls.html.divider": "bölen",
		"controls.html.header": "Başlık",
		"controls.html.paragraph": "Paragraf",
		"controls.layout.column": "sütun",
		"controls.layout.row": "Kürek çekmek",
		copy: "Panoya kopyala",
		danger: "Tehlike",
		defineColumnLayout: "Bir sütun düzeni tanımlayın",
		defineColumnWidths: "Sütun genişliklerini tanımla",
		description: "Yardım Metni",
		descriptionField: "Açıklama",
		"editing.row": "Satırı Düzenleme",
		editorTitle: "Form Öğeleri",
		field: "Alan",
		"field.property.invalid": "geçerli değil",
		"field.property.isChecked": "kontrol edildi",
		"field.property.isNotVisible": "görünür değil",
		"field.property.isVisible": "görünür",
		"field.property.label": "etiket",
		"field.property.valid": "geçerli",
		"field.property.value": "değer",
		fieldNonEditable: "Bu alan düzenlenemez.",
		fieldRemoveWarning: "Bu alanı kaldırmak istediğinizden emin misiniz?",
		fileUpload: "Dosya yükleme",
		formUpdated: "Form Güncelleme",
		getStarted: "Başlamak için bir alanı sağdan sürükleyin.",
		group: "grup",
		grouped: "gruplanmış",
		hidden: "Gizli Giriş",
		hide: "Düzenle",
		htmlElements: "HTML Öğeleri",
		if: "Eğer",
		"if.condition.source.placeholder": "kaynak",
		"if.condition.target.placeholder": "hedef değer",
		info: "Bilgi",
		"input.date": "tarih",
		"input.text": "Metin",
		label: "Etiket",
		labelCount: "{label} {count}",
		labelEmpty: "Saha Etiketi boş olamaz",
		"lang.af": "Afrika",
		"lang.ar": "Arapça",
		"lang.cs": "Çek",
		"lang.de": "Almanca",
		"lang.en": "İngilizce",
		"lang.es": "İspanyol",
		"lang.fa": "Farsça",
		"lang.fi": "Fince",
		"lang.fr": "Fransızca",
		"lang.he": "İbranice",
		"lang.hi": "Hintçe",
		"lang.hu": "Macarca",
		"lang.it": "İtalyan",
		"lang.ja": "Japonca",
		"lang.nb": "Norveç Bokmål'ı",
		"lang.pl": "Lehçe",
		"lang.pt": "Portekizce",
		"lang.ro": "Romence",
		"lang.ru": "Rusça",
		"lang.th": "Tayca",
		"lang.tr": "Türkçe",
		"lang.zh": "Çince",
		layout: "düzen",
		limitRole: "Aşağıdaki rollerden bir veya daha fazlasına erişimi sınırlayın:",
		mandatory: "Zorunlu",
		maxlength: "Maksimum uzunluk",
		"meta.group": "grup",
		"meta.icon": "ico",
		"meta.label": "Etiket",
		minOptionMessage: "Bu alan en az 2 seçenek gerektirir",
		name: "isim",
		newOptionLabel: "Yeni tip}",
		no: "Yok hayır",
		number: "Numara",
		off: "kapalı",
		on: "üzerinde",
		"operator.contains": "içeren",
		"operator.equals": "eşittir",
		"operator.notContains": "içermiyor",
		"operator.notEquals": "eşit değil",
		"operator.notVisible": "görünür değil",
		"operator.visible": "gözle görülür",
		option: "seçenek",
		optional: "isteğe bağlı",
		optionEmpty: "Seçenek değeri gerekli",
		optionLabel: "Seçenek {count}",
		options: "Seçenekler",
		or: "veya",
		order: "Sipariş",
		"panel.label.attrs": "Öznitellikler",
		"panel.label.conditions": "Koşullar",
		"panel.label.config": "Yapılandırma",
		"panel.label.meta": "Meta",
		"panel.label.options": "Seçenekler",
		"panelEditButtons.attrs": "+ Özellik",
		"panelEditButtons.conditions": "+ Durum",
		"panelEditButtons.config": "+ Yapılandırma",
		"panelEditButtons.options": "+ Seçenek",
		placeholder: "Yer tutucu",
		"placeholder.className": "boşluk ayrılmış sınıflar",
		"placeholder.email": "Size e-posta adresi",
		"placeholder.label": "Etiket",
		"placeholder.password": "Şifrenizi girin",
		"placeholder.placeholder": "Yer tutucu",
		"placeholder.text": "Bir metin girin",
		"placeholder.textarea": "Çok fazla metin girin",
		"placeholder.value": "değer",
		preview: "Ön izleme",
		primary: "Birincil",
		remove: "Kaldır",
		removeMessage: "Öğeyi Kaldır",
		removeType: "{Type} öğesini kaldır",
		required: "gereklidir",
		reset: "Reset",
		richText: "Zengin metin editörü",
		roles: "Erişim",
		row: "Kürek çekmek",
		"row.makeInputGroup": "Bu satırı bir giriş grubu yapın.",
		"row.makeInputGroupDesc": "Giriş Grupları, kullanıcıların bir kerede giriş setleri eklemesine olanak tanır.",
		"row.settings.fieldsetWrap": "Satırı & lt; fieldset & gt; etiket",
		"row.settings.fieldsetWrap.aria": "Fieldset'te Satır Sarma",
		save: "Kayıt etmek",
		secondary: "İkincil",
		select: "seçmek",
		selectColor: "Renk seç",
		selectionsMessage: "Birden Çok Seçime İzin Ver",
		selectOptions: "Seçenekler",
		separator: "Ayırıcı",
		settings: "Ayarlar",
		size: "Boyut",
		sizes: "Boyutları",
		"sizes.lg": "Büyük",
		"sizes.m": "Varsayılan",
		"sizes.sm": "Küçük",
		"sizes.xs": "Çok küçük",
		style: "stil",
		styles: "stiller",
		"styles.btn": "Düğme Stili",
		"styles.btn.danger": "Tehlike",
		"styles.btn.default": "Varsayılan",
		"styles.btn.info": "Bilgi",
		"styles.btn.primary": "Birincil",
		"styles.btn.success": "başarı",
		"styles.btn.warning": "Uyarı",
		subtype: "tip",
		success: "başarı",
		text: "Metin alanı",
		then: "Sonra",
		"then.condition.target.placeholder": "hedef",
		toggle: "geçiş",
		ungrouped: "A-Gruplanmış",
		warning: "Uyarı",
		yes: "Evet"
	},
	"zh-CN": {
		"zh-CN": "中文（中国）",
		dir: "ltr",
		"en-US": "英语",
		"af-ZA": "南非荷兰语（南非）",
		"ar-TN": "阿拉伯语（突尼斯）",
		"cs-CZ": "捷克语（捷克）",
		"de-DE": "德语（德国）",
		"es-ES": "欧洲西班牙语",
		"fa-IR": "波斯语（伊朗）",
		"fi-FI": "芬兰语（芬兰）",
		"fr-FR": "法语（法国）",
		"he-IL": "希伯来语（以色列）",
		"hi-IN": "印地语（印度）",
		"hu-HU": "匈牙利语（匈牙利）",
		"it-IT": "意大利语（意大利）",
		"ja-JP": "日语（日本）",
		"nb-NO": "书面挪威语（挪威）",
		"pl-PL": "波兰语（波兰）",
		"pt-BR": "巴西葡萄牙语",
		"pt-PT": "欧洲葡萄牙语",
		"ro-RO": "罗马尼亚语（罗马尼亚）",
		"ru-RU": "俄语（俄罗斯）",
		"th-TH": "泰语（泰国）",
		"tr-TR": "土耳其语（土耳其）",
		"zh-HK": "中文（中国香港特别行政区）",
		"action.add.attrs.attr": "你想添加什么属性？",
		"action.add.attrs.value": "默认值",
		addOption: "添加选项",
		allFieldsRemoved: "所有字段都已删除。",
		allowSelect: "允许选择",
		and: "和",
		attribute: "属性",
		attributeNotPermitted: "不允许使用属性“{attribute}”，请选择其他属性。",
		attributes: "属性",
		"attrs.class": "类",
		"attrs.className": "类",
		"attrs.dir": "方向",
		"attrs.id": "ID",
		"attrs.required": "需要",
		"attrs.style": "样式",
		"attrs.title": "标题",
		"attrs.type": "类型",
		"attrs.value": "值",
		autocomplete: "自动完成",
		button: "按键",
		cancel: "取消",
		cannotBeEmpty: "此字段不能为空",
		cannotClearFields: "没有要清除的字段",
		checkbox: "复选框",
		checkboxes: "复选框",
		class: "类",
		clear: "明确",
		clearAllMessage: "您确定要清除所有字段吗？",
		close: "关",
		column: "柱",
		"condition.target.placeholder": "目标",
		"condition.type.and": "和",
		"condition.type.if": "如果",
		"condition.type.or": "或者",
		"condition.type.then": "然后",
		"condition.value.placeholder": "值",
		confirmClearAll: "您确定要删除所有字段吗？",
		content: "内容",
		control: "控制",
		"controlGroups.nextGroup": "下一组",
		"controlGroups.prevGroup": "上一组",
		"controls.filteringTerm": "过滤“{term}”",
		"controls.form.button": "按键",
		"controls.form.checkbox-group": "复选框组",
		"controls.form.input.date": "日期",
		"controls.form.input.email": "电子邮件",
		"controls.form.input.file": "上传文件",
		"controls.form.input.hidden": "隐藏的输入",
		"controls.form.input.number": "数",
		"controls.form.input.text": "文字输入",
		"controls.form.radio-group": "广播组",
		"controls.form.select": "选择",
		"controls.form.textarea": "文本区",
		"controls.groups.form": "表格字段",
		"controls.groups.html": "HTML元素",
		"controls.groups.layout": "布局",
		"controls.html.divider": "分频器",
		"controls.html.header": "头",
		"controls.html.paragraph": "段",
		"controls.layout.column": "柱",
		"controls.layout.row": "行",
		copy: "复制到剪贴板",
		danger: "危险",
		defineColumnLayout: "定义列布局",
		defineColumnWidths: "定义列宽",
		description: "帮助文字",
		descriptionField: "描述",
		"editing.row": "编辑行",
		editorTitle: "表单元素",
		field: "领域",
		"field.property.invalid": "无效",
		"field.property.isChecked": "已检查",
		"field.property.isNotVisible": "不可见",
		"field.property.isVisible": "是可见的",
		"field.property.label": "标签",
		"field.property.valid": "有效",
		"field.property.value": "值",
		fieldNonEditable: "此字段无法编辑。",
		fieldRemoveWarning: "您确定要删除此字段吗？",
		fileUpload: "上传文件",
		formUpdated: "表格更新",
		getStarted: "从右侧拖动一个字段即可开始使用。",
		group: "组",
		grouped: "分组",
		hidden: "隐藏的输入",
		hide: "编辑",
		htmlElements: "HTML元素",
		if: "如果",
		"if.condition.source.placeholder": "资源",
		"if.condition.target.placeholder": "目标价值",
		info: "信息",
		"input.date": "日期",
		"input.text": "文本",
		label: "标签",
		labelCount: "{label} {count}",
		labelEmpty: "字段标签不能为空",
		"lang.af": "非洲人",
		"lang.ar": "阿拉伯",
		"lang.cs": "捷克语",
		"lang.de": "德语",
		"lang.en": "英语",
		"lang.es": "西班牙语",
		"lang.fa": "波斯语",
		"lang.fi": "芬兰",
		"lang.fr": "法语",
		"lang.he": "希伯来语",
		"lang.hi": "印地语",
		"lang.hu": "匈牙利",
		"lang.it": "意大利语",
		"lang.ja": "日本人",
		"lang.nb": "挪威博克马尔语",
		"lang.pl": "抛光",
		"lang.pt": "葡萄牙语",
		"lang.ro": "罗马尼亚语",
		"lang.ru": "俄语",
		"lang.th": "泰国",
		"lang.tr": "土耳其",
		"lang.zh": "中国人",
		layout: "布局",
		limitRole: "限制对以下一个或多个角色的访问：",
		mandatory: "强制性",
		maxlength: "最长长度",
		"meta.group": "组",
		"meta.icon": "ICO",
		"meta.label": "标签",
		minOptionMessage: "此字段至少需要2个选项",
		name: "名称",
		newOptionLabel: "新型}",
		no: "没有",
		number: "数",
		off: "离",
		on: "上",
		"operator.contains": "包含",
		"operator.equals": "等于",
		"operator.notContains": "不包含",
		"operator.notEquals": "不平等",
		"operator.notVisible": "不可见",
		"operator.visible": "可见",
		option: "选项",
		optional: "可选的",
		optionEmpty: "需要选项值",
		optionLabel: "选项{count}",
		options: "选项",
		or: "要么",
		order: "订购",
		"panel.label.attrs": "属性",
		"panel.label.conditions": "条件",
		"panel.label.config": "组态",
		"panel.label.meta": "元",
		"panel.label.options": "选项",
		"panelEditButtons.attrs": "+属性",
		"panelEditButtons.conditions": "+条件",
		"panelEditButtons.config": "+ 配置",
		"panelEditButtons.options": "+选项",
		placeholder: "占位符",
		"placeholder.className": "空间分隔的课程",
		"placeholder.email": "输入您的电子邮件",
		"placeholder.label": "标签",
		"placeholder.password": "输入您的密码",
		"placeholder.placeholder": "占位符",
		"placeholder.text": "输入一些文字",
		"placeholder.textarea": "输入大量文字",
		"placeholder.value": "值",
		preview: "预习",
		primary: "主",
		remove: "去掉",
		removeMessage: "删除元素",
		removeType: "删除{type}",
		required: "需要",
		reset: "重启",
		richText: "富文本编辑器",
		roles: "访问",
		row: "行",
		"row.makeInputGroup": "将此行设为输入组。",
		"row.makeInputGroupDesc": "输入组使用户可以一次添加输入集。",
		"row.settings.fieldsetWrap": "在＆lt; fieldset＆gt;中换行。标签",
		"row.settings.fieldsetWrap.aria": "在Fieldset中换行",
		save: "保存",
		secondary: "次要",
		select: "选择",
		selectColor: "选择颜色",
		selectionsMessage: "允许多个选择",
		selectOptions: "选项",
		separator: "分隔器",
		settings: "设置",
		size: "尺寸",
		sizes: "尺寸",
		"sizes.lg": "大",
		"sizes.m": "默认",
		"sizes.sm": "小",
		"sizes.xs": "超小",
		style: "样式",
		styles: "样式",
		"styles.btn": "按钮样式",
		"styles.btn.danger": "危险",
		"styles.btn.default": "默认",
		"styles.btn.info": "信息",
		"styles.btn.primary": "主",
		"styles.btn.success": "成功",
		"styles.btn.warning": "警告",
		subtype: "类型",
		success: "成功",
		text: "文本域",
		then: "然后",
		"then.condition.target.placeholder": "目标",
		toggle: "切换",
		ungrouped: "A-分组",
		warning: "警告",
		yes: "是"
	},
	"zh-HK": {
		"zh-HK": "中文（中國香港特別行政區）",
		dir: "ltr",
		"en-US": "英語",
		"af-ZA": "南非荷蘭文（南非）",
		"ar-TN": "阿拉伯文（突尼西亞）",
		"cs-CZ": "捷克文（捷克）",
		"de-DE": "德文（德國）",
		"es-ES": "歐洲西班牙文",
		"fa-IR": "波斯文（伊朗）",
		"fi-FI": "芬蘭文（芬蘭）",
		"fr-FR": "法文（法國）",
		"he-IL": "希伯來文（以色列）",
		"hi-IN": "印地文（印度）",
		"hu-HU": "匈牙利文（匈牙利）",
		"it-IT": "意大利文（意大利）",
		"ja-JP": "日文（日本）",
		"nb-NO": "巴克摩挪威文（挪威）",
		"pl-PL": "波蘭文（波蘭）",
		"pt-BR": "巴西葡萄牙文",
		"pt-PT": "歐洲葡萄牙文",
		"ro-RO": "羅馬尼亞文（羅馬尼亞）",
		"ru-RU": "俄文（俄羅斯）",
		"th-TH": "泰文（泰國）",
		"tr-TR": "土耳其文（土耳其）",
		"zh-CN": "中文（中國）",
		"action.add.attrs.attr": "您想新增什麼屬性？",
		"action.add.attrs.value": "預設值",
		addOption: "新增選項",
		allFieldsRemoved: "所有欄位均已刪除。",
		allowSelect: "允許選擇",
		and: "和",
		attribute: "屬性",
		attributeNotPermitted: "不允許使用屬性“{attribute}”，請選擇其他屬性。",
		attributes: "屬性",
		"attrs.class": "班級",
		"attrs.className": "班級",
		"attrs.dir": "方向",
		"attrs.id": "ID",
		"attrs.required": "必需的",
		"attrs.style": "風格",
		"attrs.title": "標題",
		"attrs.type": "類型",
		"attrs.value": "價值",
		autocomplete: "自動完成",
		button: "按鈕",
		cancel: "取消",
		cannotBeEmpty: "該欄位不能為空",
		cannotClearFields: "沒有要清除的字段",
		checkbox: "複選框",
		checkboxes: "複選框",
		class: "班級",
		clear: "清除",
		clearAllMessage: "您確定要清除所有欄位嗎？",
		close: "關閉",
		column: "柱子",
		"condition.target.placeholder": "目標",
		"condition.type.and": "和",
		"condition.type.if": "如果",
		"condition.type.or": "或者",
		"condition.type.then": "然後",
		"condition.value.placeholder": "價值",
		confirmClearAll: "您確定要刪除所有欄位嗎？",
		content: "內容",
		control: "控制",
		"controlGroups.nextGroup": "下一組",
		"controlGroups.prevGroup": "上一組",
		"controls.filteringTerm": "過濾“{term}”",
		"controls.form.button": "按鈕",
		"controls.form.checkbox-group": "複選框組",
		"controls.form.input.date": "日期",
		"controls.form.input.email": "電子郵件",
		"controls.form.input.file": "文件上傳",
		"controls.form.input.hidden": "隱藏輸入",
		"controls.form.input.number": "數位",
		"controls.form.input.text": "文字輸入",
		"controls.form.radio-group": "無線電集團",
		"controls.form.select": "選擇",
		"controls.form.textarea": "文字區",
		"controls.groups.form": "表單字段",
		"controls.groups.html": "HTML 元素",
		"controls.groups.layout": "佈局",
		"controls.html.divider": "分音器",
		"controls.html.header": "標頭",
		"controls.html.paragraph": "段落",
		"controls.layout.column": "柱子",
		"controls.layout.row": "排",
		copy: "複製到剪貼簿",
		danger: "危險",
		defineColumnLayout: "定義列佈局",
		defineColumnWidths: "定義列寬",
		description: "幫助文本",
		descriptionField: "描述",
		"editing.row": "編輯行",
		editorTitle: "表單元素",
		field: "場地",
		"field.property.invalid": "無效",
		"field.property.isChecked": "已檢查",
		"field.property.isNotVisible": "不可見",
		"field.property.isVisible": "是可見的",
		"field.property.label": "標籤",
		"field.property.valid": "有效的",
		"field.property.value": "價值",
		fieldNonEditable: "該字段無法編輯。",
		fieldRemoveWarning: "您確定要刪除該欄位嗎？",
		fileUpload: "文件上傳",
		formUpdated: "表格已更新",
		getStarted: "從右側拖曳一個欄位即可開始。",
		group: "團體",
		grouped: "分組",
		hidden: "隱藏輸入",
		hide: "編輯",
		htmlElements: "HTML 元素",
		if: "如果",
		"if.condition.source.placeholder": "來源",
		"if.condition.target.placeholder": "目標/價值",
		info: "資訊",
		"input.date": "日期",
		"input.text": "文字",
		label: "標籤",
		labelCount: "{標籤} {計數}",
		labelEmpty: "字段標籤不能為空",
		"lang.af": "非洲人",
		"lang.ar": "阿拉伯",
		"lang.cs": "捷克語",
		"lang.de": "德文",
		"lang.en": "英語",
		"lang.es": "西班牙語",
		"lang.fa": "波斯語",
		"lang.fi": "芬蘭",
		"lang.fr": "法語",
		"lang.he": "希伯來文",
		"lang.hi": "印地文",
		"lang.hu": "匈牙利",
		"lang.it": "義大利語",
		"lang.ja": "日本人",
		"lang.nb": "挪威博克馬爾語",
		"lang.pl": "拋光",
		"lang.pt": "葡萄牙語",
		"lang.ro": "羅馬尼亞語",
		"lang.ru": "俄文",
		"lang.th": "泰國",
		"lang.tr": "土耳其",
		"lang.zh": "中國人",
		layout: "佈局",
		limitRole: "限制對以下一個或多個角色的存取：",
		mandatory: "強制的",
		maxlength: "最大長度",
		"meta.group": "團體",
		"meta.icon": "伊科",
		"meta.label": "標籤",
		minOptionMessage: "該欄位至少需要 2 個選項",
		name: "姓名",
		newOptionLabel: "新型}",
		no: "不",
		number: "數位",
		off: "離開",
		on: "在",
		"operator.contains": "包含",
		"operator.equals": "等於",
		"operator.notContains": "不包含",
		"operator.notEquals": "不等於",
		"operator.notVisible": "不可見",
		"operator.visible": "可見的",
		option: "選項",
		optional: "選修的",
		optionEmpty: "所需選項值",
		optionLabel: "選項{計數}",
		options: "選項",
		or: "或者",
		order: "命令",
		"panel.label.attrs": "屬性",
		"panel.label.conditions": "狀況",
		"panel.label.config": "配置",
		"panel.label.meta": "元",
		"panel.label.options": "選項",
		"panelEditButtons.attrs": "+ 屬性",
		"panelEditButtons.conditions": "+ 條件",
		"panelEditButtons.config": "+ 配置",
		"panelEditButtons.options": "+ 選項",
		placeholder: "佔位符",
		"placeholder.className": "空間分隔的類別",
		"placeholder.email": "輸入您的電子郵件",
		"placeholder.label": "標籤",
		"placeholder.password": "輸入您的密碼",
		"placeholder.placeholder": "佔位符",
		"placeholder.text": "輸入一些文字",
		"placeholder.textarea": "輸入大量文字",
		"placeholder.value": "價值",
		preview: "預覽",
		primary: "基本的",
		remove: "消除",
		removeMessage: "刪除元素",
		removeType: "刪除{類型}",
		required: "必需的",
		reset: "重置",
		richText: "富文本編輯器",
		roles: "使用權",
		row: "排",
		"row.makeInputGroup": "使該行成為輸入組。",
		"row.makeInputGroupDesc": "輸入群組使用戶能夠一次添加多組輸入。",
		"row.settings.fieldsetWrap": "將行換行到 <fieldset> 中標籤",
		"row.settings.fieldsetWrap.aria": "在 Fieldset 中換行",
		save: "節省",
		secondary: "中學",
		select: "選擇",
		selectColor: "選擇顏色",
		selectionsMessage: "允許多項選擇",
		selectOptions: "選項",
		separator: "分離器",
		settings: "設定",
		size: "尺寸",
		sizes: "尺寸",
		"sizes.lg": "大的",
		"sizes.m": "預設",
		"sizes.sm": "小的",
		"sizes.xs": "特小號",
		style: "風格",
		styles: "風格",
		"styles.btn": "按鈕樣式",
		"styles.btn.danger": "危險",
		"styles.btn.default": "預設",
		"styles.btn.info": "資訊",
		"styles.btn.primary": "基本的",
		"styles.btn.success": "成功",
		"styles.btn.warning": "警告",
		subtype: "類型",
		success: "成功",
		text: "文字欄位",
		then: "然後",
		"then.condition.target.placeholder": "目標",
		toggle: "切換",
		ungrouped: "未分組",
		warning: "警告",
		yes: "是的"
	}
};
e$1["af-ZA"], e$1["ar-TN"], e$1["cs-CZ"], e$1["de-DE"], e$1["en-US"], e$1["es-ES"], e$1["fa-IR"], e$1["fi-FI"], e$1["fr-FR"], e$1["he-IL"], e$1["hi-IN"], e$1["hu-HU"], e$1["it-IT"], e$1["ja-JP"], e$1["nb-NO"], e$1["pl-PL"], e$1["pt-BR"], e$1["pt-PT"], e$1["ro-RO"], e$1["ru-RU"], e$1["th-TH"], e$1["tr-TR"], e$1["zh-CN"], e$1["zh-HK"];
e$1["af-ZA"];
e$1["ar-TN"];
e$1["cs-CZ"];
e$1["de-DE"];
//#endregion
//#region node_modules/@draggable/formeo-languages/dist/formeo-languages.es.js
/**
@draggable/formeo-languages - https://github.com/Draggable/formeo-languages#readme
Version: 3.4.1
Author: Kevin Chappell <kevin.b.chappell@gmail.com> (https://kevin-chappell.com)
*/
var i = e$1["en-US"];
e$1["es-ES"];
e$1["fa-IR"];
e$1["fi-FI"];
e$1["fr-FR"];
e$1["he-IL"];
e$1["hi-IN"];
e$1["hu-HU"];
e$1["it-IT"];
e$1["ja-JP"];
e$1["nb-NO"];
e$1["pl-PL"];
e$1["pt-BR"];
e$1["pt-PT"];
e$1["ro-RO"];
e$1["ru-RU"];
e$1["th-TH"];
e$1["tr-TR"];
e$1["zh-CN"];
e$1["zh-HK"];
//#endregion
//#region node_modules/@draggable/i18n/dist/i18n.es.min.js
var t, e, n, s;
var init_i18n_es_min = __esmMin((() => {
	/**
	@draggable/i18n - https://github.com/Draggable/i18n
	Version: 1.1.0
	Author: Draggable https://draggable.io
	*/
	Object.freeze({
		method: "GET",
		body: ""
	});
	t = {
		extension: ".lang",
		location: "assets/lang/",
		langs: ["en-US"],
		locale: "en-US",
		override: {}
	}, e = null, n = new Proxy(class s {
		constructor(e = t) {
			this.langs = Object.create(null), this.loaded = [], this.processConfig(e);
		}
		processConfig(e) {
			const { location: n, ...s } = {
				...t,
				...e
			}, a = n.endsWith("/") ? n : `${n}/`;
			this.config = {
				location: a,
				...s
			};
			const { preloaded: i = {}, override: r = {} } = this.config, l = new Set([...Object.keys(i), ...Object.keys(r)]);
			for (const t of l) {
				const e = {
					...i[t] || {},
					...r[t] || {}
				};
				this.applyLanguage(t, e);
			}
			this.locale = this.config.locale || this.config.langs[0];
		}
		init(t) {
			return this.processConfig({
				...this.config,
				...t
			}), this.setCurrent(this.locale);
		}
		addLanguage(t, e = {}) {
			e = "string" == typeof e ? s.processFile(e) : e, this.applyLanguage(t, e), this.loaded.push(t), this.config.langs.push(t);
		}
		getValue(t, e = this.locale) {
			return this.langs[e]?.[t] || this.getFallbackValue(t);
		}
		getFallbackValue(t) {
			return Object.values(this.langs).find((e) => e[t])?.[t];
		}
		makeSafe(t) {
			const e = {
				"{": String.raw`\{`,
				"}": String.raw`\}`,
				"|": String.raw`\|`
			}, n = t.replaceAll(/[{}|]/g, (t) => e[t]);
			return new RegExp(n, "g");
		}
		put(t, e) {
			return this.current[t] = e, e;
		}
		get(t, e) {
			let n = this.getValue(t);
			if (!n) return;
			if (!e) return n;
			const s = n.match(/\{[^}]+?\}/g);
			if (!s) return n;
			if ("object" == typeof e) for (const a of s) {
				const t = a.slice(1, -1);
				n = n.replace(this.makeSafe(a), e[t] ?? "");
			}
			else n = n.replaceAll(/\{[^}]+?\}/g, e);
			return n;
		}
		static processFile(t) {
			return n.fromFile(t.replaceAll("\n\n", "\n"));
		}
		static fromFile(t) {
			const e = t.split("\n"), n = {};
			for (let s, a = 0; a < e.length; a++) s = /^(.+?) *?= *?([^\n]+)/.exec(e[a]), s && (n[s[1]] = s[2].trim());
			return n;
		}
		static getInstance(t) {
			return e || (e = new s(t)), e;
		}
		static resetInstance() {
			e = null;
		}
		async loadLang(t, e = !0) {
			if (this.loaded.includes(t) && e) return this.langs[t];
			const n = `${this.config.location}${t}${this.config.extension}`;
			try {
				const e = await async function(t) {
					try {
						const e = await fetch(t);
						if (!e.ok) throw new Error(`HTTP error! status: ${e.status}`);
						return await e[t.endsWith(".lang") ? "text" : "json"]();
					} catch (e) {
						throw e;
					}
				}(n), a = s.processFile(e);
				return this.applyLanguage(t, a), this.langs[t];
			} catch (a) {
				return this.applyLanguage(t);
			}
		}
		applyLanguage(t, e = {}) {
			const n = this.config.override[t] || {}, s = this.langs[t] || {};
			return this.langs[t] = {
				...s,
				...e,
				...n
			}, this.loaded.push(t), this.langs[t];
		}
		get getLangs() {
			return this.config.langs;
		}
		async setCurrent(t = "en-US") {
			return this.loaded.includes(t) || await this.loadLang(t), this.locale = t, this.current = this.langs[t], this.current;
		}
	}, {
		apply: (t, e, n) => t.getInstance(...n),
		construct: (t, e) => new t(...e),
		get: (t, e) => t[e]
	}), s = n.getInstance();
}));
//#endregion
//#region node_modules/@draggable/tooltip/dist/tooltip.es.min.js
init_i18n_es_min();
/**
@draggable/tooltip - https://github.com/Draggable/tooltip
Version: 1.2.2
Author: Draggable https://draggable.io
*/
(function() {
	"use strict";
	try {
		if ("undefined" != typeof document) {
			var o = document.createElement("style");
			o.appendChild(document.createTextNode("._3x4ZIcu-{position:absolute;background:#1f2937;color:#fff;padding:.75rem;border-radius:.375rem;max-width:200px;z-index:50;visibility:hidden;opacity:0;transition:opacity .2s;pointer-events:none;left:0;top:0}._3x4ZIcu-.JIt36hCJ{visibility:visible;opacity:1;pointer-events:all}._3x4ZIcu-:before{content:\"\";position:absolute;width:0;height:0;border:6px solid transparent}._3x4ZIcu-[data-position=top]:before{border-top-color:#1f2937;bottom:-12px;left:50%;transform:translate(-50%)}._3x4ZIcu-[data-position=bottom]:before{border-bottom-color:#1f2937;top:-12px;left:50%;transform:translate(-50%)}._3x4ZIcu-[data-position=left]:before{border-left-color:#1f2937;right:-12px;top:50%;transform:translateY(-50%)}._3x4ZIcu-[data-position=right]:before{border-right-color:#1f2937;left:-12px;top:50%;transform:translateY(-50%)}._3x4ZIcu-[data-position=top-left]:before{border-top-color:#1f2937;bottom:-12px;left:12px;transform:none}._3x4ZIcu-[data-position=top-right]:before{border-top-color:#1f2937;bottom:-12px;right:12px;left:auto;transform:none}._3x4ZIcu-[data-position=bottom-left]:before{border-bottom-color:#1f2937;top:-12px;left:12px;transform:none}._3x4ZIcu-[data-position=bottom-right]:before{border-bottom-color:#1f2937;top:-12px;right:12px;left:auto;transform:none}")), document.head.appendChild(o);
		}
	} catch (t) {
		console.error("vite-plugin-css-injected-by-js", t);
	}
})();
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var styles = {
	tooltip: "_3x4ZIcu-",
	visible: "JIt36hCJ"
};
var defaultOptions$1 = { triggerName: "tooltip" };
var _SmartTooltip = class _SmartTooltip {
	constructor(options = defaultOptions$1) {
		__publicField(this, "triggerName");
		__publicField(this, "tooltip");
		__publicField(this, "activeTriggerType", null);
		__publicField(this, "spacing", 12);
		__publicField(this, "handleClick", (e) => {
			const triggerName = this.triggerName;
			const trigger = e.target.closest(`[${triggerName}][${triggerName}-type="click"]`);
			if (trigger) if (this.isVisible()) this.hide();
			else {
				const content = trigger.getAttribute(`${triggerName}`);
				this.show(trigger, content);
				this.activeTriggerType = "click";
			}
			else this.hide();
		});
		__publicField(this, "handleMouseOver", (e) => {
			const triggerName = this.triggerName;
			const trigger = e.target.closest(`[${triggerName}]`);
			if (this.activeTriggerType !== "click" && (trigger == null ? void 0 : trigger.getAttribute(`${triggerName}-type`)) !== "click") {
				const content = trigger == null ? void 0 : trigger.getAttribute(`${triggerName}`);
				if (content) {
					this.show(trigger, content);
					this.activeTriggerType = "hover";
				}
			}
		});
		__publicField(this, "handleMouseOut", (e) => {
			const triggerName = this.triggerName;
			const trigger = e.target.closest(`[${triggerName}]`);
			if (this.activeTriggerType !== "click" && (trigger == null ? void 0 : trigger.getAttribute(`${triggerName}-type`)) !== "click") this.hide();
		});
		__publicField(this, "handleResize", () => {
			if (this.isVisible()) this.hide();
		});
		__publicField(this, "handleScroll", () => {
			if (this.isVisible()) this.hide();
		});
		if (_SmartTooltip.instance) _SmartTooltip.instance.destroy();
		this.triggerName = `data-${options.triggerName}`;
		this.tooltip = document.createElement("div");
		this.tooltip.className = `d-tooltip ${styles.tooltip}`;
		document.body.appendChild(this.tooltip);
		this.setupEventListeners();
		_SmartTooltip.instance = this;
	}
	setupEventListeners() {
		document.addEventListener("mouseover", this.handleMouseOver);
		document.addEventListener("mouseout", this.handleMouseOut);
		document.addEventListener("touchstart", this.handleMouseOver);
		document.addEventListener("touchend", this.handleMouseOut);
		document.addEventListener("click", this.handleClick);
		globalThis.addEventListener("resize", this.handleResize);
		globalThis.addEventListener("scroll", this.handleScroll, true);
	}
	isVisible() {
		return this.tooltip.classList.contains(styles.visible);
	}
	/**
	* Calculates the optimal position for the tooltip relative to the trigger element.
	* It tries to find a position where the tooltip fits within the viewport.
	* If no position fits, it defaults to the first position in the list.
	*
	* @param {HTMLElement} trigger - The HTML element that triggers the tooltip.
	* @returns {Position} The calculated position for the tooltip.
	*/
	calculatePosition(trigger) {
		const triggerRect = trigger.getBoundingClientRect();
		const tooltipRect = this.tooltip.getBoundingClientRect();
		const positions = [
			{
				name: "top",
				x: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
				y: triggerRect.top - tooltipRect.height - this.spacing
			},
			{
				name: "bottom",
				x: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
				y: triggerRect.bottom + this.spacing
			},
			{
				name: "left",
				x: triggerRect.left - tooltipRect.width - this.spacing,
				y: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
			},
			{
				name: "right",
				x: triggerRect.right + this.spacing,
				y: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
			},
			{
				name: "top-left",
				x: triggerRect.left,
				y: triggerRect.top - tooltipRect.height - this.spacing
			},
			{
				name: "top-right",
				x: triggerRect.right - tooltipRect.width,
				y: triggerRect.top - tooltipRect.height - this.spacing
			},
			{
				name: "bottom-left",
				x: triggerRect.left,
				y: triggerRect.bottom + this.spacing
			},
			{
				name: "bottom-right",
				x: triggerRect.right - tooltipRect.width,
				y: triggerRect.bottom + this.spacing
			}
		];
		return positions.find((pos) => this.fitsInViewport(pos, tooltipRect)) || positions[0];
	}
	/**
	* Checks if the tooltip fits within the viewport and is not obstructed by other elements.
	*
	* @param pos - The position of the tooltip.
	* @param tooltipRect - The bounding rectangle of the tooltip.
	* @returns `true` if the tooltip fits within the viewport and is not obstructed, otherwise `false`.
	*/
	fitsInViewport(pos, tooltipRect) {
		if (!(pos.x >= 0 && pos.y >= 0 && pos.x + tooltipRect.width <= globalThis.innerWidth && pos.y + tooltipRect.height <= globalThis.innerHeight)) return false;
		return [
			[pos.x, pos.y],
			[pos.x + tooltipRect.width, pos.y],
			[pos.x, pos.y + tooltipRect.height],
			[pos.x + tooltipRect.width, pos.y + tooltipRect.height],
			[pos.x + tooltipRect.width / 2, pos.y + tooltipRect.height / 2]
		].flatMap(([x, y]) => Array.from(document.elementsFromPoint(x, y))).filter((element) => {
			if (this.tooltip.contains(element) || element === this.tooltip || element.classList.contains(styles.tooltip) || getComputedStyle(element).pointerEvents === "none") return false;
		}).length === 0;
	}
	show(trigger, content) {
		this.tooltip.innerHTML = content ?? "";
		this.tooltip.classList.add(styles.visible);
		const position = this.calculatePosition(trigger);
		this.tooltip.style.left = `${position.x}px`;
		this.tooltip.style.top = `${position.y}px`;
		this.tooltip.dataset.position = position.name;
	}
	hide() {
		this.tooltip.classList.remove(styles.visible);
		this.activeTriggerType = null;
	}
	destroy() {
		document.removeEventListener("mouseover", this.handleMouseOver);
		document.removeEventListener("mouseout", this.handleMouseOut);
		document.removeEventListener("touchstart", this.handleMouseOver);
		document.removeEventListener("touchend", this.handleMouseOut);
		document.removeEventListener("click", this.handleClick);
		globalThis.removeEventListener("resize", this.handleResize);
		globalThis.removeEventListener("scroll", this.handleScroll, true);
		this.tooltip.remove();
		if (_SmartTooltip.instance === this) _SmartTooltip.instance = null;
	}
};
__publicField(_SmartTooltip, "instance", null);
var SmartTooltip = _SmartTooltip;
if (globalThis !== void 0) globalThis.SmartTooltip = SmartTooltip;
//#endregion
//#region package.json
var name$1, version$2, type, main, module$1, unpkg, exports$1, files, homepage, repository, author, contributors, bugs, description, keywords, ignore, config, scripts, devDependencies, dependencies, release, commitlint, package_default;
var init_package = __esmMin((() => {
	name$1 = "formeo";
	version$2 = "5.1.1";
	type = "module";
	main = "dist/formeo.cjs.js";
	module$1 = "dist/formeo.es.js";
	unpkg = "dist/formeo.umd.js";
	exports$1 = {
		".": {
			"import": "./dist/formeo.es.js",
			"require": "./dist/formeo.cjs.js",
			"default": "./dist/formeo.umd.js"
		},
		"./dist/formeo.min.css": {
			"import": "./dist/formeo.min.css",
			"require": "./dist/formeo.min.css",
			"default": "./dist/formeo.min.css"
		}
	};
	files = ["dist/*", "demo/**/*"];
	homepage = "https://formeo.io";
	repository = {
		"url": "https://github.com/Draggable/formeo",
		"type": "git"
	};
	author = "Draggable https://draggable.io";
	contributors = [{
		"name": "Kevin Chappell",
		"email": "kevin@chappell.dev",
		"url": "https://kevin-chappell.com"
	}];
	bugs = { "url": "https://github.com/draggable/formeo/issues" };
	description = "A zero dependency JavaScript module for drag and drop form creation.";
	keywords = [
		"drag and drop",
		"form builder",
		"form maker",
		"forms"
	];
	ignore = [
		"**/*",
		"node_modules",
		"test"
	];
	config = { "files": {
		"test": ["test/**/*.spec.js"],
		"formeo-editor": { "js": "src/js/editor.js" },
		"formeo-renderer": { "js": "src/js/renderer.js" },
		"site": ["demo/assets/sass/site.scss"]
	} };
	scripts = {
		"dev": "NODE_ENV=development vite",
		"preview": "vite preview",
		"prebuild:lib": "rm -rf dist",
		"build:lib": "npm-run-all -p build:lib:unminified build:lib:minified",
		"build:lib:unminified": "vite build --config vite.config.lib.mjs --mode production",
		"build:lib:minified": "vite build --config vite.config.lib.mjs --mode production-minified",
		"build": "npm-run-all -p build:icons build:demo",
		"prebuild": "npm run build:lib",
		"postbuild": "npm run generate:jsonSchema",
		"build:demo": "vite build --mode demo",
		"postbuild:demo": "node --no-warnings tools/copy-assets.mjs",
		"build:demo:watch": "vite build --mode demo --watch",
		"build:icons": "node ./tools/generate-sprite",
		"lint": "biome check ./src",
		"lint:fix": "biome check --write ./src",
		"format": "biome format --write .",
		"test": "node --loader=./tools/svg-loader.mjs --import=./tools/__mocks__/sprite-init.mjs --experimental-test-snapshots --require ./tools/test-setup.cjs --test --no-warnings src/**/*.test.{js,mjs}",
		"test:watch": "node --watch --loader=./tools/svg-loader.mjs --import=./tools/__mocks__/sprite-init.mjs --experimental-test-snapshots --require ./tools/test-setup.cjs --test --no-warnings src/**/*.test.{js,mjs}",
		"test:updateSnapshots": "node --loader=./tools/svg-loader.mjs --import=./tools/__mocks__/sprite-init.mjs --experimental-test-snapshots --test-update-snapshots --require ./tools/test-setup.cjs --test --no-warnings src/**/*.test.{js,mjs}",
		"test:ci": "npm test --coverage",
		"start": "npm-run-all build:icons dev",
		"semantic-release": "semantic-release --ci --debug",
		"copy:lang": "node ./tools/copy-directory.mjs ./node_modules/formeo-i18n/dist/lang ./src/demo/assets/lang",
		"travis-deploy-once": "travis-deploy-once --pro",
		"playwright:test": "playwright test",
		"playwright:test:ui": "playwright test --ui",
		"playwright:test:report": "playwright show-report",
		"playwright:test:ci": "playwright test --reporter=dot",
		"prepush": "npm test",
		"prepare": "lefthook install",
		"postmerge": "lefthook install",
		"generate:jsonSchema": "node --experimental-strip-types --no-warnings ./tools/generate-json-schema.ts"
	};
	devDependencies = {
		"@biomejs/biome": "^2.3.3",
		"@commitlint/cli": "^21.0.1",
		"@commitlint/config-conventional": "^21.0.1",
		"@playwright/test": "^1.49.1",
		"@semantic-release/changelog": "^6.0.3",
		"@semantic-release/git": "^10.0.1",
		"@semantic-release/github": "^12.0.8",
		"@semantic-release/npm": "^13.1.3",
		"@types/node": "^25.8.0",
		"ace-builds": "^1.36.5",
		"esbuild": "^0.28.0",
		"jsdom": "^29.1.1",
		"lefthook": "^2.1.6",
		"npm-run-all": "^4.1.5",
		"sass-embedded": "^1.80.1",
		"semantic-release": "^25.0.2",
		"svg-sprite": "^2.0.4",
		"vite": "^8.0.13",
		"vite-plugin-banner": "^0.8.0",
		"vite-plugin-compression": "^0.5.1",
		"vite-plugin-html": "^3.2.2",
		"zod": "^4.4.3",
		"zod-to-json-schema": "^3.23.5"
	};
	dependencies = {
		"@draggable/formeo-languages": "^3.4.1",
		"@draggable/i18n": "^1.0.7",
		"@draggable/tooltip": "^1.2.2",
		"lodash": "^4.17.21",
		"sortablejs": "^1.15.3"
	};
	release = {
		"branches": ["main"],
		"verifyConditions": [
			"@semantic-release/changelog",
			"@semantic-release/npm",
			"@semantic-release/git",
			"@semantic-release/github"
		],
		"prepare": [
			"@semantic-release/changelog",
			"@semantic-release/npm",
			"@semantic-release/git"
		],
		"publish": ["@semantic-release/npm", "@semantic-release/github"],
		"success": ["@semantic-release/github"],
		"fail": ["@semantic-release/github"]
	};
	commitlint = {
		"extends": ["@commitlint/config-conventional"],
		"rules": { "type-enum": [
			2,
			"always",
			[
				"build",
				"chore",
				"ci",
				"docs",
				"feat",
				"fix",
				"perf",
				"refactor",
				"revert",
				"style",
				"test"
			]
		] }
	};
	package_default = {
		name: name$1,
		version: version$2,
		type,
		main,
		module: module$1,
		unpkg,
		exports: exports$1,
		files,
		homepage,
		repository,
		author,
		contributors,
		bugs,
		description,
		keywords,
		license: "MIT",
		ignore,
		config,
		scripts,
		devDependencies,
		dependencies,
		release,
		commitlint
	};
}));
//#endregion
//#region node_modules/lodash/_listCacheClear.js
var require__listCacheClear = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Removes all key-value entries from the list cache.
	*
	* @private
	* @name clear
	* @memberOf ListCache
	*/
	function listCacheClear() {
		this.__data__ = [];
		this.size = 0;
	}
	module.exports = listCacheClear;
}));
//#endregion
//#region node_modules/lodash/eq.js
var require_eq = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Performs a
	* [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	* comparison between two values to determine if they are equivalent.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to compare.
	* @param {*} other The other value to compare.
	* @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	* @example
	*
	* var object = { 'a': 1 };
	* var other = { 'a': 1 };
	*
	* _.eq(object, object);
	* // => true
	*
	* _.eq(object, other);
	* // => false
	*
	* _.eq('a', 'a');
	* // => true
	*
	* _.eq('a', Object('a'));
	* // => false
	*
	* _.eq(NaN, NaN);
	* // => true
	*/
	function eq(value, other) {
		return value === other || value !== value && other !== other;
	}
	module.exports = eq;
}));
//#endregion
//#region node_modules/lodash/_assocIndexOf.js
var require__assocIndexOf = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var eq = require_eq();
	/**
	* Gets the index at which the `key` is found in `array` of key-value pairs.
	*
	* @private
	* @param {Array} array The array to inspect.
	* @param {*} key The key to search for.
	* @returns {number} Returns the index of the matched value, else `-1`.
	*/
	function assocIndexOf(array, key) {
		var length = array.length;
		while (length--) if (eq(array[length][0], key)) return length;
		return -1;
	}
	module.exports = assocIndexOf;
}));
//#endregion
//#region node_modules/lodash/_listCacheDelete.js
var require__listCacheDelete = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var assocIndexOf = require__assocIndexOf();
	/** Built-in value references. */
	var splice = Array.prototype.splice;
	/**
	* Removes `key` and its value from the list cache.
	*
	* @private
	* @name delete
	* @memberOf ListCache
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function listCacheDelete(key) {
		var data = this.__data__, index = assocIndexOf(data, key);
		if (index < 0) return false;
		if (index == data.length - 1) data.pop();
		else splice.call(data, index, 1);
		--this.size;
		return true;
	}
	module.exports = listCacheDelete;
}));
//#endregion
//#region node_modules/lodash/_listCacheGet.js
var require__listCacheGet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var assocIndexOf = require__assocIndexOf();
	/**
	* Gets the list cache value for `key`.
	*
	* @private
	* @name get
	* @memberOf ListCache
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function listCacheGet(key) {
		var data = this.__data__, index = assocIndexOf(data, key);
		return index < 0 ? void 0 : data[index][1];
	}
	module.exports = listCacheGet;
}));
//#endregion
//#region node_modules/lodash/_listCacheHas.js
var require__listCacheHas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var assocIndexOf = require__assocIndexOf();
	/**
	* Checks if a list cache value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf ListCache
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function listCacheHas(key) {
		return assocIndexOf(this.__data__, key) > -1;
	}
	module.exports = listCacheHas;
}));
//#endregion
//#region node_modules/lodash/_listCacheSet.js
var require__listCacheSet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var assocIndexOf = require__assocIndexOf();
	/**
	* Sets the list cache `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf ListCache
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the list cache instance.
	*/
	function listCacheSet(key, value) {
		var data = this.__data__, index = assocIndexOf(data, key);
		if (index < 0) {
			++this.size;
			data.push([key, value]);
		} else data[index][1] = value;
		return this;
	}
	module.exports = listCacheSet;
}));
//#endregion
//#region node_modules/lodash/_ListCache.js
var require__ListCache = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var listCacheClear = require__listCacheClear(), listCacheDelete = require__listCacheDelete(), listCacheGet = require__listCacheGet(), listCacheHas = require__listCacheHas(), listCacheSet = require__listCacheSet();
	/**
	* Creates an list cache object.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function ListCache(entries) {
		var index = -1, length = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length) {
			var entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype["delete"] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;
	module.exports = ListCache;
}));
//#endregion
//#region node_modules/lodash/_stackClear.js
var require__stackClear = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ListCache = require__ListCache();
	/**
	* Removes all key-value entries from the stack.
	*
	* @private
	* @name clear
	* @memberOf Stack
	*/
	function stackClear() {
		this.__data__ = new ListCache();
		this.size = 0;
	}
	module.exports = stackClear;
}));
//#endregion
//#region node_modules/lodash/_stackDelete.js
var require__stackDelete = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Removes `key` and its value from the stack.
	*
	* @private
	* @name delete
	* @memberOf Stack
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function stackDelete(key) {
		var data = this.__data__, result = data["delete"](key);
		this.size = data.size;
		return result;
	}
	module.exports = stackDelete;
}));
//#endregion
//#region node_modules/lodash/_stackGet.js
var require__stackGet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Gets the stack value for `key`.
	*
	* @private
	* @name get
	* @memberOf Stack
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function stackGet(key) {
		return this.__data__.get(key);
	}
	module.exports = stackGet;
}));
//#endregion
//#region node_modules/lodash/_stackHas.js
var require__stackHas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if a stack value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf Stack
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function stackHas(key) {
		return this.__data__.has(key);
	}
	module.exports = stackHas;
}));
//#endregion
//#region node_modules/lodash/_freeGlobal.js
var require__freeGlobal = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = typeof global == "object" && global && global.Object === Object && global;
}));
//#endregion
//#region node_modules/lodash/_root.js
var require__root = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var freeGlobal = require__freeGlobal();
	/** Detect free variable `self`. */
	var freeSelf = typeof self == "object" && self && self.Object === Object && self;
	module.exports = freeGlobal || freeSelf || Function("return this")();
}));
//#endregion
//#region node_modules/lodash/_Symbol.js
var require__Symbol = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__root().Symbol;
}));
//#endregion
//#region node_modules/lodash/_getRawTag.js
var require__getRawTag = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Symbol = require__Symbol();
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	/**
	* Used to resolve the
	* [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	* of values.
	*/
	var nativeObjectToString = objectProto.toString;
	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : void 0;
	/**
	* A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the raw `toStringTag`.
	*/
	function getRawTag(value) {
		var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
		try {
			value[symToStringTag] = void 0;
			var unmasked = true;
		} catch (e) {}
		var result = nativeObjectToString.call(value);
		if (unmasked) if (isOwn) value[symToStringTag] = tag;
		else delete value[symToStringTag];
		return result;
	}
	module.exports = getRawTag;
}));
//#endregion
//#region node_modules/lodash/_objectToString.js
var require__objectToString = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Used to resolve the
	* [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	* of values.
	*/
	var nativeObjectToString = Object.prototype.toString;
	/**
	* Converts `value` to a string using `Object.prototype.toString`.
	*
	* @private
	* @param {*} value The value to convert.
	* @returns {string} Returns the converted string.
	*/
	function objectToString(value) {
		return nativeObjectToString.call(value);
	}
	module.exports = objectToString;
}));
//#endregion
//#region node_modules/lodash/_baseGetTag.js
var require__baseGetTag = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Symbol = require__Symbol(), getRawTag = require__getRawTag(), objectToString = require__objectToString();
	/** `Object#toString` result references. */
	var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : void 0;
	/**
	* The base implementation of `getTag` without fallbacks for buggy environments.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the `toStringTag`.
	*/
	function baseGetTag(value) {
		if (value == null) return value === void 0 ? undefinedTag : nullTag;
		return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
	}
	module.exports = baseGetTag;
}));
//#endregion
//#region node_modules/lodash/isObject.js
var require_isObject = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if `value` is the
	* [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	* of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is an object, else `false`.
	* @example
	*
	* _.isObject({});
	* // => true
	*
	* _.isObject([1, 2, 3]);
	* // => true
	*
	* _.isObject(_.noop);
	* // => true
	*
	* _.isObject(null);
	* // => false
	*/
	function isObject(value) {
		var type = typeof value;
		return value != null && (type == "object" || type == "function");
	}
	module.exports = isObject;
}));
//#endregion
//#region node_modules/lodash/isFunction.js
var require_isFunction = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGetTag = require__baseGetTag(), isObject = require_isObject();
	/** `Object#toString` result references. */
	var asyncTag = "[object AsyncFunction]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
	/**
	* Checks if `value` is classified as a `Function` object.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a function, else `false`.
	* @example
	*
	* _.isFunction(_);
	* // => true
	*
	* _.isFunction(/abc/);
	* // => false
	*/
	function isFunction(value) {
		if (!isObject(value)) return false;
		var tag = baseGetTag(value);
		return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}
	module.exports = isFunction;
}));
//#endregion
//#region node_modules/lodash/_coreJsData.js
var require__coreJsData = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__root()["__core-js_shared__"];
}));
//#endregion
//#region node_modules/lodash/_isMasked.js
var require__isMasked = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var coreJsData = require__coreJsData();
	/** Used to detect methods masquerading as native. */
	var maskSrcKey = function() {
		var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
		return uid ? "Symbol(src)_1." + uid : "";
	}();
	/**
	* Checks if `func` has its source masked.
	*
	* @private
	* @param {Function} func The function to check.
	* @returns {boolean} Returns `true` if `func` is masked, else `false`.
	*/
	function isMasked(func) {
		return !!maskSrcKey && maskSrcKey in func;
	}
	module.exports = isMasked;
}));
//#endregion
//#region node_modules/lodash/_toSource.js
var require__toSource = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;
	/**
	* Converts `func` to its source code.
	*
	* @private
	* @param {Function} func The function to convert.
	* @returns {string} Returns the source code.
	*/
	function toSource(func) {
		if (func != null) {
			try {
				return funcToString.call(func);
			} catch (e) {}
			try {
				return func + "";
			} catch (e) {}
		}
		return "";
	}
	module.exports = toSource;
}));
//#endregion
//#region node_modules/lodash/_baseIsNative.js
var require__baseIsNative = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isFunction = require_isFunction(), isMasked = require__isMasked(), isObject = require_isObject(), toSource = require__toSource();
	/**
	* Used to match `RegExp`
	* [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	*/
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	/** Used for built-in method references. */
	var funcProto = Function.prototype, objectProto = Object.prototype;
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	/** Used to detect if a method is native. */
	var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
	/**
	* The base implementation of `_.isNative` without bad shim checks.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a native function,
	*  else `false`.
	*/
	function baseIsNative(value) {
		if (!isObject(value) || isMasked(value)) return false;
		return (isFunction(value) ? reIsNative : reIsHostCtor).test(toSource(value));
	}
	module.exports = baseIsNative;
}));
//#endregion
//#region node_modules/lodash/_getValue.js
var require__getValue = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Gets the value at `key` of `object`.
	*
	* @private
	* @param {Object} [object] The object to query.
	* @param {string} key The key of the property to get.
	* @returns {*} Returns the property value.
	*/
	function getValue(object, key) {
		return object == null ? void 0 : object[key];
	}
	module.exports = getValue;
}));
//#endregion
//#region node_modules/lodash/_getNative.js
var require__getNative = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseIsNative = require__baseIsNative(), getValue = require__getValue();
	/**
	* Gets the native function at `key` of `object`.
	*
	* @private
	* @param {Object} object The object to query.
	* @param {string} key The key of the method to get.
	* @returns {*} Returns the function if it's native, else `undefined`.
	*/
	function getNative(object, key) {
		var value = getValue(object, key);
		return baseIsNative(value) ? value : void 0;
	}
	module.exports = getNative;
}));
//#endregion
//#region node_modules/lodash/_Map.js
var require__Map = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__getNative()(require__root(), "Map");
}));
//#endregion
//#region node_modules/lodash/_nativeCreate.js
var require__nativeCreate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__getNative()(Object, "create");
}));
//#endregion
//#region node_modules/lodash/_hashClear.js
var require__hashClear = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var nativeCreate = require__nativeCreate();
	/**
	* Removes all key-value entries from the hash.
	*
	* @private
	* @name clear
	* @memberOf Hash
	*/
	function hashClear() {
		this.__data__ = nativeCreate ? nativeCreate(null) : {};
		this.size = 0;
	}
	module.exports = hashClear;
}));
//#endregion
//#region node_modules/lodash/_hashDelete.js
var require__hashDelete = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Removes `key` and its value from the hash.
	*
	* @private
	* @name delete
	* @memberOf Hash
	* @param {Object} hash The hash to modify.
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function hashDelete(key) {
		var result = this.has(key) && delete this.__data__[key];
		this.size -= result ? 1 : 0;
		return result;
	}
	module.exports = hashDelete;
}));
//#endregion
//#region node_modules/lodash/_hashGet.js
var require__hashGet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var nativeCreate = require__nativeCreate();
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = "__lodash_hash_undefined__";
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* Gets the hash value for `key`.
	*
	* @private
	* @name get
	* @memberOf Hash
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function hashGet(key) {
		var data = this.__data__;
		if (nativeCreate) {
			var result = data[key];
			return result === HASH_UNDEFINED ? void 0 : result;
		}
		return hasOwnProperty.call(data, key) ? data[key] : void 0;
	}
	module.exports = hashGet;
}));
//#endregion
//#region node_modules/lodash/_hashHas.js
var require__hashHas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var nativeCreate = require__nativeCreate();
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* Checks if a hash value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf Hash
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function hashHas(key) {
		var data = this.__data__;
		return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
	}
	module.exports = hashHas;
}));
//#endregion
//#region node_modules/lodash/_hashSet.js
var require__hashSet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var nativeCreate = require__nativeCreate();
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = "__lodash_hash_undefined__";
	/**
	* Sets the hash `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf Hash
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the hash instance.
	*/
	function hashSet(key, value) {
		var data = this.__data__;
		this.size += this.has(key) ? 0 : 1;
		data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
		return this;
	}
	module.exports = hashSet;
}));
//#endregion
//#region node_modules/lodash/_Hash.js
var require__Hash = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var hashClear = require__hashClear(), hashDelete = require__hashDelete(), hashGet = require__hashGet(), hashHas = require__hashHas(), hashSet = require__hashSet();
	/**
	* Creates a hash object.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function Hash(entries) {
		var index = -1, length = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length) {
			var entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	Hash.prototype.clear = hashClear;
	Hash.prototype["delete"] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;
	module.exports = Hash;
}));
//#endregion
//#region node_modules/lodash/_mapCacheClear.js
var require__mapCacheClear = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Hash = require__Hash(), ListCache = require__ListCache(), Map = require__Map();
	/**
	* Removes all key-value entries from the map.
	*
	* @private
	* @name clear
	* @memberOf MapCache
	*/
	function mapCacheClear() {
		this.size = 0;
		this.__data__ = {
			"hash": new Hash(),
			"map": new (Map || ListCache)(),
			"string": new Hash()
		};
	}
	module.exports = mapCacheClear;
}));
//#endregion
//#region node_modules/lodash/_isKeyable.js
var require__isKeyable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if `value` is suitable for use as unique object key.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	*/
	function isKeyable(value) {
		var type = typeof value;
		return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
	}
	module.exports = isKeyable;
}));
//#endregion
//#region node_modules/lodash/_getMapData.js
var require__getMapData = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isKeyable = require__isKeyable();
	/**
	* Gets the data for `map`.
	*
	* @private
	* @param {Object} map The map to query.
	* @param {string} key The reference key.
	* @returns {*} Returns the map data.
	*/
	function getMapData(map, key) {
		var data = map.__data__;
		return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
	}
	module.exports = getMapData;
}));
//#endregion
//#region node_modules/lodash/_mapCacheDelete.js
var require__mapCacheDelete = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getMapData = require__getMapData();
	/**
	* Removes `key` and its value from the map.
	*
	* @private
	* @name delete
	* @memberOf MapCache
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function mapCacheDelete(key) {
		var result = getMapData(this, key)["delete"](key);
		this.size -= result ? 1 : 0;
		return result;
	}
	module.exports = mapCacheDelete;
}));
//#endregion
//#region node_modules/lodash/_mapCacheGet.js
var require__mapCacheGet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getMapData = require__getMapData();
	/**
	* Gets the map value for `key`.
	*
	* @private
	* @name get
	* @memberOf MapCache
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function mapCacheGet(key) {
		return getMapData(this, key).get(key);
	}
	module.exports = mapCacheGet;
}));
//#endregion
//#region node_modules/lodash/_mapCacheHas.js
var require__mapCacheHas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getMapData = require__getMapData();
	/**
	* Checks if a map value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf MapCache
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function mapCacheHas(key) {
		return getMapData(this, key).has(key);
	}
	module.exports = mapCacheHas;
}));
//#endregion
//#region node_modules/lodash/_mapCacheSet.js
var require__mapCacheSet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getMapData = require__getMapData();
	/**
	* Sets the map `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf MapCache
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the map cache instance.
	*/
	function mapCacheSet(key, value) {
		var data = getMapData(this, key), size = data.size;
		data.set(key, value);
		this.size += data.size == size ? 0 : 1;
		return this;
	}
	module.exports = mapCacheSet;
}));
//#endregion
//#region node_modules/lodash/_MapCache.js
var require__MapCache = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var mapCacheClear = require__mapCacheClear(), mapCacheDelete = require__mapCacheDelete(), mapCacheGet = require__mapCacheGet(), mapCacheHas = require__mapCacheHas(), mapCacheSet = require__mapCacheSet();
	/**
	* Creates a map cache object to store key-value pairs.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function MapCache(entries) {
		var index = -1, length = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length) {
			var entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype["delete"] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;
	module.exports = MapCache;
}));
//#endregion
//#region node_modules/lodash/_stackSet.js
var require__stackSet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ListCache = require__ListCache(), Map = require__Map(), MapCache = require__MapCache();
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;
	/**
	* Sets the stack `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf Stack
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the stack cache instance.
	*/
	function stackSet(key, value) {
		var data = this.__data__;
		if (data instanceof ListCache) {
			var pairs = data.__data__;
			if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
				pairs.push([key, value]);
				this.size = ++data.size;
				return this;
			}
			data = this.__data__ = new MapCache(pairs);
		}
		data.set(key, value);
		this.size = data.size;
		return this;
	}
	module.exports = stackSet;
}));
//#endregion
//#region node_modules/lodash/_Stack.js
var require__Stack = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ListCache = require__ListCache(), stackClear = require__stackClear(), stackDelete = require__stackDelete(), stackGet = require__stackGet(), stackHas = require__stackHas(), stackSet = require__stackSet();
	/**
	* Creates a stack cache object to store key-value pairs.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function Stack(entries) {
		var data = this.__data__ = new ListCache(entries);
		this.size = data.size;
	}
	Stack.prototype.clear = stackClear;
	Stack.prototype["delete"] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;
	module.exports = Stack;
}));
//#endregion
//#region node_modules/lodash/_defineProperty.js
var require__defineProperty = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getNative = require__getNative();
	module.exports = function() {
		try {
			var func = getNative(Object, "defineProperty");
			func({}, "", {});
			return func;
		} catch (e) {}
	}();
}));
//#endregion
//#region node_modules/lodash/_baseAssignValue.js
var require__baseAssignValue = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var defineProperty = require__defineProperty();
	/**
	* The base implementation of `assignValue` and `assignMergeValue` without
	* value checks.
	*
	* @private
	* @param {Object} object The object to modify.
	* @param {string} key The key of the property to assign.
	* @param {*} value The value to assign.
	*/
	function baseAssignValue(object, key, value) {
		if (key == "__proto__" && defineProperty) defineProperty(object, key, {
			"configurable": true,
			"enumerable": true,
			"value": value,
			"writable": true
		});
		else object[key] = value;
	}
	module.exports = baseAssignValue;
}));
//#endregion
//#region node_modules/lodash/_assignMergeValue.js
var require__assignMergeValue = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseAssignValue = require__baseAssignValue(), eq = require_eq();
	/**
	* This function is like `assignValue` except that it doesn't assign
	* `undefined` values.
	*
	* @private
	* @param {Object} object The object to modify.
	* @param {string} key The key of the property to assign.
	* @param {*} value The value to assign.
	*/
	function assignMergeValue(object, key, value) {
		if (value !== void 0 && !eq(object[key], value) || value === void 0 && !(key in object)) baseAssignValue(object, key, value);
	}
	module.exports = assignMergeValue;
}));
//#endregion
//#region node_modules/lodash/_createBaseFor.js
var require__createBaseFor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Creates a base function for methods like `_.forIn` and `_.forOwn`.
	*
	* @private
	* @param {boolean} [fromRight] Specify iterating from right to left.
	* @returns {Function} Returns the new base function.
	*/
	function createBaseFor(fromRight) {
		return function(object, iteratee, keysFunc) {
			var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
			while (length--) {
				var key = props[fromRight ? length : ++index];
				if (iteratee(iterable[key], key, iterable) === false) break;
			}
			return object;
		};
	}
	module.exports = createBaseFor;
}));
//#endregion
//#region node_modules/lodash/_baseFor.js
var require__baseFor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__createBaseFor()();
}));
//#endregion
//#region node_modules/lodash/_cloneBuffer.js
var require__cloneBuffer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var root = require__root();
	/** Detect free variable `exports`. */
	var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
	/** Built-in value references. */
	var Buffer = freeModule && freeModule.exports === freeExports ? root.Buffer : void 0, allocUnsafe = Buffer ? Buffer.allocUnsafe : void 0;
	/**
	* Creates a clone of  `buffer`.
	*
	* @private
	* @param {Buffer} buffer The buffer to clone.
	* @param {boolean} [isDeep] Specify a deep clone.
	* @returns {Buffer} Returns the cloned buffer.
	*/
	function cloneBuffer(buffer, isDeep) {
		if (isDeep) return buffer.slice();
		var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
		buffer.copy(result);
		return result;
	}
	module.exports = cloneBuffer;
}));
//#endregion
//#region node_modules/lodash/_Uint8Array.js
var require__Uint8Array = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__root().Uint8Array;
}));
//#endregion
//#region node_modules/lodash/_cloneArrayBuffer.js
var require__cloneArrayBuffer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Uint8Array = require__Uint8Array();
	/**
	* Creates a clone of `arrayBuffer`.
	*
	* @private
	* @param {ArrayBuffer} arrayBuffer The array buffer to clone.
	* @returns {ArrayBuffer} Returns the cloned array buffer.
	*/
	function cloneArrayBuffer(arrayBuffer) {
		var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
		new Uint8Array(result).set(new Uint8Array(arrayBuffer));
		return result;
	}
	module.exports = cloneArrayBuffer;
}));
//#endregion
//#region node_modules/lodash/_cloneTypedArray.js
var require__cloneTypedArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var cloneArrayBuffer = require__cloneArrayBuffer();
	/**
	* Creates a clone of `typedArray`.
	*
	* @private
	* @param {Object} typedArray The typed array to clone.
	* @param {boolean} [isDeep] Specify a deep clone.
	* @returns {Object} Returns the cloned typed array.
	*/
	function cloneTypedArray(typedArray, isDeep) {
		var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
		return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
	}
	module.exports = cloneTypedArray;
}));
//#endregion
//#region node_modules/lodash/_copyArray.js
var require__copyArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Copies the values of `source` to `array`.
	*
	* @private
	* @param {Array} source The array to copy values from.
	* @param {Array} [array=[]] The array to copy values to.
	* @returns {Array} Returns `array`.
	*/
	function copyArray(source, array) {
		var index = -1, length = source.length;
		array || (array = Array(length));
		while (++index < length) array[index] = source[index];
		return array;
	}
	module.exports = copyArray;
}));
//#endregion
//#region node_modules/lodash/_baseCreate.js
var require__baseCreate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isObject = require_isObject();
	/** Built-in value references. */
	var objectCreate = Object.create;
	module.exports = function() {
		function object() {}
		return function(proto) {
			if (!isObject(proto)) return {};
			if (objectCreate) return objectCreate(proto);
			object.prototype = proto;
			var result = new object();
			object.prototype = void 0;
			return result;
		};
	}();
}));
//#endregion
//#region node_modules/lodash/_overArg.js
var require__overArg = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Creates a unary function that invokes `func` with its argument transformed.
	*
	* @private
	* @param {Function} func The function to wrap.
	* @param {Function} transform The argument transform.
	* @returns {Function} Returns the new function.
	*/
	function overArg(func, transform) {
		return function(arg) {
			return func(transform(arg));
		};
	}
	module.exports = overArg;
}));
//#endregion
//#region node_modules/lodash/_getPrototype.js
var require__getPrototype = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__overArg()(Object.getPrototypeOf, Object);
}));
//#endregion
//#region node_modules/lodash/_isPrototype.js
var require__isPrototype = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	/**
	* Checks if `value` is likely a prototype object.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	*/
	function isPrototype(value) {
		var Ctor = value && value.constructor;
		return value === (typeof Ctor == "function" && Ctor.prototype || objectProto);
	}
	module.exports = isPrototype;
}));
//#endregion
//#region node_modules/lodash/_initCloneObject.js
var require__initCloneObject = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseCreate = require__baseCreate(), getPrototype = require__getPrototype(), isPrototype = require__isPrototype();
	/**
	* Initializes an object clone.
	*
	* @private
	* @param {Object} object The object to clone.
	* @returns {Object} Returns the initialized clone.
	*/
	function initCloneObject(object) {
		return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
	}
	module.exports = initCloneObject;
}));
//#endregion
//#region node_modules/lodash/isObjectLike.js
var require_isObjectLike = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if `value` is object-like. A value is object-like if it's not `null`
	* and has a `typeof` result of "object".
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	* @example
	*
	* _.isObjectLike({});
	* // => true
	*
	* _.isObjectLike([1, 2, 3]);
	* // => true
	*
	* _.isObjectLike(_.noop);
	* // => false
	*
	* _.isObjectLike(null);
	* // => false
	*/
	function isObjectLike(value) {
		return value != null && typeof value == "object";
	}
	module.exports = isObjectLike;
}));
//#endregion
//#region node_modules/lodash/_baseIsArguments.js
var require__baseIsArguments = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGetTag = require__baseGetTag(), isObjectLike = require_isObjectLike();
	/** `Object#toString` result references. */
	var argsTag = "[object Arguments]";
	/**
	* The base implementation of `_.isArguments`.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is an `arguments` object,
	*/
	function baseIsArguments(value) {
		return isObjectLike(value) && baseGetTag(value) == argsTag;
	}
	module.exports = baseIsArguments;
}));
//#endregion
//#region node_modules/lodash/isArguments.js
var require_isArguments = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseIsArguments = require__baseIsArguments(), isObjectLike = require_isObjectLike();
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	module.exports = baseIsArguments(function() {
		return arguments;
	}()) ? baseIsArguments : function(value) {
		return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
	};
}));
//#endregion
//#region node_modules/lodash/isArray.js
var require_isArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = Array.isArray;
}));
//#endregion
//#region node_modules/lodash/isLength.js
var require_isLength = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	/**
	* Checks if `value` is a valid array-like length.
	*
	* **Note:** This method is loosely based on
	* [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	* @example
	*
	* _.isLength(3);
	* // => true
	*
	* _.isLength(Number.MIN_VALUE);
	* // => false
	*
	* _.isLength(Infinity);
	* // => false
	*
	* _.isLength('3');
	* // => false
	*/
	function isLength(value) {
		return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	module.exports = isLength;
}));
//#endregion
//#region node_modules/lodash/isArrayLike.js
var require_isArrayLike = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isFunction = require_isFunction(), isLength = require_isLength();
	/**
	* Checks if `value` is array-like. A value is considered array-like if it's
	* not a function and has a `value.length` that's an integer greater than or
	* equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	* @example
	*
	* _.isArrayLike([1, 2, 3]);
	* // => true
	*
	* _.isArrayLike(document.body.children);
	* // => true
	*
	* _.isArrayLike('abc');
	* // => true
	*
	* _.isArrayLike(_.noop);
	* // => false
	*/
	function isArrayLike(value) {
		return value != null && isLength(value.length) && !isFunction(value);
	}
	module.exports = isArrayLike;
}));
//#endregion
//#region node_modules/lodash/isArrayLikeObject.js
var require_isArrayLikeObject = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isArrayLike = require_isArrayLike(), isObjectLike = require_isObjectLike();
	/**
	* This method is like `_.isArrayLike` except that it also checks if `value`
	* is an object.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is an array-like object,
	*  else `false`.
	* @example
	*
	* _.isArrayLikeObject([1, 2, 3]);
	* // => true
	*
	* _.isArrayLikeObject(document.body.children);
	* // => true
	*
	* _.isArrayLikeObject('abc');
	* // => false
	*
	* _.isArrayLikeObject(_.noop);
	* // => false
	*/
	function isArrayLikeObject(value) {
		return isObjectLike(value) && isArrayLike(value);
	}
	module.exports = isArrayLikeObject;
}));
//#endregion
//#region node_modules/lodash/stubFalse.js
var require_stubFalse = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This method returns `false`.
	*
	* @static
	* @memberOf _
	* @since 4.13.0
	* @category Util
	* @returns {boolean} Returns `false`.
	* @example
	*
	* _.times(2, _.stubFalse);
	* // => [false, false]
	*/
	function stubFalse() {
		return false;
	}
	module.exports = stubFalse;
}));
//#endregion
//#region node_modules/lodash/isBuffer.js
var require_isBuffer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var root = require__root(), stubFalse = require_stubFalse();
	/** Detect free variable `exports`. */
	var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
	/** Built-in value references. */
	var Buffer = freeModule && freeModule.exports === freeExports ? root.Buffer : void 0;
	module.exports = (Buffer ? Buffer.isBuffer : void 0) || stubFalse;
}));
//#endregion
//#region node_modules/lodash/isPlainObject.js
var require_isPlainObject = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGetTag = require__baseGetTag(), getPrototype = require__getPrototype(), isObjectLike = require_isObjectLike();
	/** `Object#toString` result references. */
	var objectTag = "[object Object]";
	/** Used for built-in method references. */
	var funcProto = Function.prototype, objectProto = Object.prototype;
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);
	/**
	* Checks if `value` is a plain object, that is, an object created by the
	* `Object` constructor or one with a `[[Prototype]]` of `null`.
	*
	* @static
	* @memberOf _
	* @since 0.8.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	* @example
	*
	* function Foo() {
	*   this.a = 1;
	* }
	*
	* _.isPlainObject(new Foo);
	* // => false
	*
	* _.isPlainObject([1, 2, 3]);
	* // => false
	*
	* _.isPlainObject({ 'x': 0, 'y': 0 });
	* // => true
	*
	* _.isPlainObject(Object.create(null));
	* // => true
	*/
	function isPlainObject(value) {
		if (!isObjectLike(value) || baseGetTag(value) != objectTag) return false;
		var proto = getPrototype(value);
		if (proto === null) return true;
		var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
		return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
	}
	module.exports = isPlainObject;
}));
//#endregion
//#region node_modules/lodash/_baseIsTypedArray.js
var require__baseIsTypedArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGetTag = require__baseGetTag(), isLength = require_isLength(), isObjectLike = require_isObjectLike();
	/** `Object#toString` result references. */
	var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", weakMapTag = "[object WeakMap]";
	var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
	/**
	* The base implementation of `_.isTypedArray` without Node.js optimizations.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	*/
	function baseIsTypedArray(value) {
		return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
	}
	module.exports = baseIsTypedArray;
}));
//#endregion
//#region node_modules/lodash/_baseUnary.js
var require__baseUnary = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* The base implementation of `_.unary` without support for storing metadata.
	*
	* @private
	* @param {Function} func The function to cap arguments for.
	* @returns {Function} Returns the new capped function.
	*/
	function baseUnary(func) {
		return function(value) {
			return func(value);
		};
	}
	module.exports = baseUnary;
}));
//#endregion
//#region node_modules/lodash/_nodeUtil.js
var require__nodeUtil = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var freeGlobal = require__freeGlobal();
	/** Detect free variable `exports`. */
	var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
	/** Detect free variable `process` from Node.js. */
	var freeProcess = freeModule && freeModule.exports === freeExports && freeGlobal.process;
	module.exports = function() {
		try {
			var types = freeModule && freeModule.require && freeModule.require("util").types;
			if (types) return types;
			return freeProcess && freeProcess.binding && freeProcess.binding("util");
		} catch (e) {}
	}();
}));
//#endregion
//#region node_modules/lodash/isTypedArray.js
var require_isTypedArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseIsTypedArray = require__baseIsTypedArray(), baseUnary = require__baseUnary(), nodeUtil = require__nodeUtil();
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
	module.exports = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
}));
//#endregion
//#region node_modules/lodash/_safeGet.js
var require__safeGet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Gets the value at `key`, unless `key` is "__proto__" or "constructor".
	*
	* @private
	* @param {Object} object The object to query.
	* @param {string} key The key of the property to get.
	* @returns {*} Returns the property value.
	*/
	function safeGet(object, key) {
		if (key === "constructor" && typeof object[key] === "function") return;
		if (key == "__proto__") return;
		return object[key];
	}
	module.exports = safeGet;
}));
//#endregion
//#region node_modules/lodash/_assignValue.js
var require__assignValue = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseAssignValue = require__baseAssignValue(), eq = require_eq();
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* Assigns `value` to `key` of `object` if the existing value is not equivalent
	* using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	* for equality comparisons.
	*
	* @private
	* @param {Object} object The object to modify.
	* @param {string} key The key of the property to assign.
	* @param {*} value The value to assign.
	*/
	function assignValue(object, key, value) {
		var objValue = object[key];
		if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) baseAssignValue(object, key, value);
	}
	module.exports = assignValue;
}));
//#endregion
//#region node_modules/lodash/_copyObject.js
var require__copyObject = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var assignValue = require__assignValue(), baseAssignValue = require__baseAssignValue();
	/**
	* Copies properties of `source` to `object`.
	*
	* @private
	* @param {Object} source The object to copy properties from.
	* @param {Array} props The property identifiers to copy.
	* @param {Object} [object={}] The object to copy properties to.
	* @param {Function} [customizer] The function to customize copied values.
	* @returns {Object} Returns `object`.
	*/
	function copyObject(source, props, object, customizer) {
		var isNew = !object;
		object || (object = {});
		var index = -1, length = props.length;
		while (++index < length) {
			var key = props[index];
			var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
			if (newValue === void 0) newValue = source[key];
			if (isNew) baseAssignValue(object, key, newValue);
			else assignValue(object, key, newValue);
		}
		return object;
	}
	module.exports = copyObject;
}));
//#endregion
//#region node_modules/lodash/_baseTimes.js
var require__baseTimes = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* The base implementation of `_.times` without support for iteratee shorthands
	* or max array length checks.
	*
	* @private
	* @param {number} n The number of times to invoke `iteratee`.
	* @param {Function} iteratee The function invoked per iteration.
	* @returns {Array} Returns the array of results.
	*/
	function baseTimes(n, iteratee) {
		var index = -1, result = Array(n);
		while (++index < n) result[index] = iteratee(index);
		return result;
	}
	module.exports = baseTimes;
}));
//#endregion
//#region node_modules/lodash/_isIndex.js
var require__isIndex = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;
	/**
	* Checks if `value` is a valid array-like index.
	*
	* @private
	* @param {*} value The value to check.
	* @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	* @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	*/
	function isIndex(value, length) {
		var type = typeof value;
		length = length == null ? MAX_SAFE_INTEGER : length;
		return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
	}
	module.exports = isIndex;
}));
//#endregion
//#region node_modules/lodash/_arrayLikeKeys.js
var require__arrayLikeKeys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseTimes = require__baseTimes(), isArguments = require_isArguments(), isArray = require_isArray(), isBuffer = require_isBuffer(), isIndex = require__isIndex(), isTypedArray = require_isTypedArray();
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* Creates an array of the enumerable property names of the array-like `value`.
	*
	* @private
	* @param {*} value The value to query.
	* @param {boolean} inherited Specify returning inherited property names.
	* @returns {Array} Returns the array of property names.
	*/
	function arrayLikeKeys(value, inherited) {
		var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
		for (var key in value) if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || isIndex(key, length)))) result.push(key);
		return result;
	}
	module.exports = arrayLikeKeys;
}));
//#endregion
//#region node_modules/lodash/_nativeKeysIn.js
var require__nativeKeysIn = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This function is like
	* [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	* except that it includes inherited enumerable properties.
	*
	* @private
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names.
	*/
	function nativeKeysIn(object) {
		var result = [];
		if (object != null) for (var key in Object(object)) result.push(key);
		return result;
	}
	module.exports = nativeKeysIn;
}));
//#endregion
//#region node_modules/lodash/_baseKeysIn.js
var require__baseKeysIn = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isObject = require_isObject(), isPrototype = require__isPrototype(), nativeKeysIn = require__nativeKeysIn();
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
	*
	* @private
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names.
	*/
	function baseKeysIn(object) {
		if (!isObject(object)) return nativeKeysIn(object);
		var isProto = isPrototype(object), result = [];
		for (var key in object) if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) result.push(key);
		return result;
	}
	module.exports = baseKeysIn;
}));
//#endregion
//#region node_modules/lodash/keysIn.js
var require_keysIn = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arrayLikeKeys = require__arrayLikeKeys(), baseKeysIn = require__baseKeysIn(), isArrayLike = require_isArrayLike();
	/**
	* Creates an array of the own and inherited enumerable property names of `object`.
	*
	* **Note:** Non-object values are coerced to objects.
	*
	* @static
	* @memberOf _
	* @since 3.0.0
	* @category Object
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names.
	* @example
	*
	* function Foo() {
	*   this.a = 1;
	*   this.b = 2;
	* }
	*
	* Foo.prototype.c = 3;
	*
	* _.keysIn(new Foo);
	* // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	*/
	function keysIn(object) {
		return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
	}
	module.exports = keysIn;
}));
//#endregion
//#region node_modules/lodash/toPlainObject.js
var require_toPlainObject = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var copyObject = require__copyObject(), keysIn = require_keysIn();
	/**
	* Converts `value` to a plain object flattening inherited enumerable string
	* keyed properties of `value` to own properties of the plain object.
	*
	* @static
	* @memberOf _
	* @since 3.0.0
	* @category Lang
	* @param {*} value The value to convert.
	* @returns {Object} Returns the converted plain object.
	* @example
	*
	* function Foo() {
	*   this.b = 2;
	* }
	*
	* Foo.prototype.c = 3;
	*
	* _.assign({ 'a': 1 }, new Foo);
	* // => { 'a': 1, 'b': 2 }
	*
	* _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
	* // => { 'a': 1, 'b': 2, 'c': 3 }
	*/
	function toPlainObject(value) {
		return copyObject(value, keysIn(value));
	}
	module.exports = toPlainObject;
}));
//#endregion
//#region node_modules/lodash/_baseMergeDeep.js
var require__baseMergeDeep = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var assignMergeValue = require__assignMergeValue(), cloneBuffer = require__cloneBuffer(), cloneTypedArray = require__cloneTypedArray(), copyArray = require__copyArray(), initCloneObject = require__initCloneObject(), isArguments = require_isArguments(), isArray = require_isArray(), isArrayLikeObject = require_isArrayLikeObject(), isBuffer = require_isBuffer(), isFunction = require_isFunction(), isObject = require_isObject(), isPlainObject = require_isPlainObject(), isTypedArray = require_isTypedArray(), safeGet = require__safeGet(), toPlainObject = require_toPlainObject();
	/**
	* A specialized version of `baseMerge` for arrays and objects which performs
	* deep merges and tracks traversed objects enabling objects with circular
	* references to be merged.
	*
	* @private
	* @param {Object} object The destination object.
	* @param {Object} source The source object.
	* @param {string} key The key of the value to merge.
	* @param {number} srcIndex The index of `source`.
	* @param {Function} mergeFunc The function to merge values.
	* @param {Function} [customizer] The function to customize assigned values.
	* @param {Object} [stack] Tracks traversed source values and their merged
	*  counterparts.
	*/
	function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
		var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
		if (stacked) {
			assignMergeValue(object, key, stacked);
			return;
		}
		var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
		var isCommon = newValue === void 0;
		if (isCommon) {
			var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
			newValue = srcValue;
			if (isArr || isBuff || isTyped) if (isArray(objValue)) newValue = objValue;
			else if (isArrayLikeObject(objValue)) newValue = copyArray(objValue);
			else if (isBuff) {
				isCommon = false;
				newValue = cloneBuffer(srcValue, true);
			} else if (isTyped) {
				isCommon = false;
				newValue = cloneTypedArray(srcValue, true);
			} else newValue = [];
			else if (isPlainObject(srcValue) || isArguments(srcValue)) {
				newValue = objValue;
				if (isArguments(objValue)) newValue = toPlainObject(objValue);
				else if (!isObject(objValue) || isFunction(objValue)) newValue = initCloneObject(srcValue);
			} else isCommon = false;
		}
		if (isCommon) {
			stack.set(srcValue, newValue);
			mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
			stack["delete"](srcValue);
		}
		assignMergeValue(object, key, newValue);
	}
	module.exports = baseMergeDeep;
}));
//#endregion
//#region node_modules/lodash/_baseMerge.js
var require__baseMerge = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Stack = require__Stack(), assignMergeValue = require__assignMergeValue(), baseFor = require__baseFor(), baseMergeDeep = require__baseMergeDeep(), isObject = require_isObject(), keysIn = require_keysIn(), safeGet = require__safeGet();
	/**
	* The base implementation of `_.merge` without support for multiple sources.
	*
	* @private
	* @param {Object} object The destination object.
	* @param {Object} source The source object.
	* @param {number} srcIndex The index of `source`.
	* @param {Function} [customizer] The function to customize merged values.
	* @param {Object} [stack] Tracks traversed source values and their merged
	*  counterparts.
	*/
	function baseMerge(object, source, srcIndex, customizer, stack) {
		if (object === source) return;
		baseFor(source, function(srcValue, key) {
			stack || (stack = new Stack());
			if (isObject(srcValue)) baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
			else {
				var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
				if (newValue === void 0) newValue = srcValue;
				assignMergeValue(object, key, newValue);
			}
		}, keysIn);
	}
	module.exports = baseMerge;
}));
//#endregion
//#region node_modules/lodash/identity.js
var require_identity = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This method returns the first argument it receives.
	*
	* @static
	* @since 0.1.0
	* @memberOf _
	* @category Util
	* @param {*} value Any value.
	* @returns {*} Returns `value`.
	* @example
	*
	* var object = { 'a': 1 };
	*
	* console.log(_.identity(object) === object);
	* // => true
	*/
	function identity(value) {
		return value;
	}
	module.exports = identity;
}));
//#endregion
//#region node_modules/lodash/_apply.js
var require__apply = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* A faster alternative to `Function#apply`, this function invokes `func`
	* with the `this` binding of `thisArg` and the arguments of `args`.
	*
	* @private
	* @param {Function} func The function to invoke.
	* @param {*} thisArg The `this` binding of `func`.
	* @param {Array} args The arguments to invoke `func` with.
	* @returns {*} Returns the result of `func`.
	*/
	function apply(func, thisArg, args) {
		switch (args.length) {
			case 0: return func.call(thisArg);
			case 1: return func.call(thisArg, args[0]);
			case 2: return func.call(thisArg, args[0], args[1]);
			case 3: return func.call(thisArg, args[0], args[1], args[2]);
		}
		return func.apply(thisArg, args);
	}
	module.exports = apply;
}));
//#endregion
//#region node_modules/lodash/_overRest.js
var require__overRest = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var apply = require__apply();
	var nativeMax = Math.max;
	/**
	* A specialized version of `baseRest` which transforms the rest array.
	*
	* @private
	* @param {Function} func The function to apply a rest parameter to.
	* @param {number} [start=func.length-1] The start position of the rest parameter.
	* @param {Function} transform The rest array transform.
	* @returns {Function} Returns the new function.
	*/
	function overRest(func, start, transform) {
		start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
		return function() {
			var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
			while (++index < length) array[index] = args[start + index];
			index = -1;
			var otherArgs = Array(start + 1);
			while (++index < start) otherArgs[index] = args[index];
			otherArgs[start] = transform(array);
			return apply(func, this, otherArgs);
		};
	}
	module.exports = overRest;
}));
//#endregion
//#region node_modules/lodash/constant.js
var require_constant = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Creates a function that returns `value`.
	*
	* @static
	* @memberOf _
	* @since 2.4.0
	* @category Util
	* @param {*} value The value to return from the new function.
	* @returns {Function} Returns the new constant function.
	* @example
	*
	* var objects = _.times(2, _.constant({ 'a': 1 }));
	*
	* console.log(objects);
	* // => [{ 'a': 1 }, { 'a': 1 }]
	*
	* console.log(objects[0] === objects[1]);
	* // => true
	*/
	function constant(value) {
		return function() {
			return value;
		};
	}
	module.exports = constant;
}));
//#endregion
//#region node_modules/lodash/_baseSetToString.js
var require__baseSetToString = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var constant = require_constant(), defineProperty = require__defineProperty(), identity = require_identity();
	module.exports = !defineProperty ? identity : function(func, string) {
		return defineProperty(func, "toString", {
			"configurable": true,
			"enumerable": false,
			"value": constant(string),
			"writable": true
		});
	};
}));
//#endregion
//#region node_modules/lodash/_shortOut.js
var require__shortOut = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used to detect hot functions by number of calls within a span of milliseconds. */
	var HOT_COUNT = 800, HOT_SPAN = 16;
	var nativeNow = Date.now;
	/**
	* Creates a function that'll short out and invoke `identity` instead
	* of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
	* milliseconds.
	*
	* @private
	* @param {Function} func The function to restrict.
	* @returns {Function} Returns the new shortable function.
	*/
	function shortOut(func) {
		var count = 0, lastCalled = 0;
		return function() {
			var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
			lastCalled = stamp;
			if (remaining > 0) {
				if (++count >= HOT_COUNT) return arguments[0];
			} else count = 0;
			return func.apply(void 0, arguments);
		};
	}
	module.exports = shortOut;
}));
//#endregion
//#region node_modules/lodash/_setToString.js
var require__setToString = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseSetToString = require__baseSetToString();
	module.exports = require__shortOut()(baseSetToString);
}));
//#endregion
//#region node_modules/lodash/_baseRest.js
var require__baseRest = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var identity = require_identity(), overRest = require__overRest(), setToString = require__setToString();
	/**
	* The base implementation of `_.rest` which doesn't validate or coerce arguments.
	*
	* @private
	* @param {Function} func The function to apply a rest parameter to.
	* @param {number} [start=func.length-1] The start position of the rest parameter.
	* @returns {Function} Returns the new function.
	*/
	function baseRest(func, start) {
		return setToString(overRest(func, start, identity), func + "");
	}
	module.exports = baseRest;
}));
//#endregion
//#region node_modules/lodash/_isIterateeCall.js
var require__isIterateeCall = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var eq = require_eq(), isArrayLike = require_isArrayLike(), isIndex = require__isIndex(), isObject = require_isObject();
	/**
	* Checks if the given arguments are from an iteratee call.
	*
	* @private
	* @param {*} value The potential iteratee value argument.
	* @param {*} index The potential iteratee index or key argument.
	* @param {*} object The potential iteratee object argument.
	* @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	*  else `false`.
	*/
	function isIterateeCall(value, index, object) {
		if (!isObject(object)) return false;
		var type = typeof index;
		if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) return eq(object[index], value);
		return false;
	}
	module.exports = isIterateeCall;
}));
//#endregion
//#region node_modules/lodash/_createAssigner.js
var require__createAssigner = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseRest = require__baseRest(), isIterateeCall = require__isIterateeCall();
	/**
	* Creates a function like `_.assign`.
	*
	* @private
	* @param {Function} assigner The function to assign values.
	* @returns {Function} Returns the new assigner function.
	*/
	function createAssigner(assigner) {
		return baseRest(function(object, sources) {
			var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
			customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
			if (guard && isIterateeCall(sources[0], sources[1], guard)) {
				customizer = length < 3 ? void 0 : customizer;
				length = 1;
			}
			object = Object(object);
			while (++index < length) {
				var source = sources[index];
				if (source) assigner(object, source, index, customizer);
			}
			return object;
		});
	}
	module.exports = createAssigner;
}));
//#endregion
//#region node_modules/lodash/mergeWith.js
var require_mergeWith = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseMerge = require__baseMerge();
	module.exports = require__createAssigner()(function(object, source, srcIndex, customizer) {
		baseMerge(object, source, srcIndex, customizer);
	});
}));
//#endregion
//#region src/lib/js/common/utils/index.mjs
/**
* Creates a throttled function that only invokes the provided callback at most once per every limit milliseconds.
*
* @param {Function} callback - The function to throttle.
* @param {number} limit - The number of milliseconds to throttle invocations to.
* @returns {Function} - Returns the new throttled function.
*/
function throttle$1(callback, limit = ANIMATION_SPEED_SLOW) {
	let lastCall = 0;
	return function(...args) {
		const now = Date.now();
		if (now - lastCall >= limit) {
			lastCall = now;
			callback.apply(this, args);
		}
	};
}
/**
* Creates a debounced function that delays invoking the provided function until after the specified delay.
*
* @param {Function} fn - The function to debounce.
* @param {number} [delay=ANIMATION_SPEED_FAST] - The number of milliseconds to delay invocation.
* @returns {Function} - A new debounced function.
*/
function debounce(fn, delay = ANIMATION_SPEED_FAST) {
	let timeoutID;
	return function(...args) {
		if (timeoutID) clearTimeout(timeoutID);
		timeoutID = setTimeout(() => fn.apply(this, args), delay);
	};
}
function identity(value) {
	return value;
}
function noop() {}
/**
* Parses the provided data argument. If the argument is a string, it attempts to parse it as JSON.
* If the parsing fails, it logs an error and returns an empty object.
* If the argument is not a string, it returns the argument as is.
*
* @param {string|Object} dataArg - The data to be parsed. Can be a JSON string or an object.
* @returns {Object} - The parsed object or the original object if the input was not a string.
*/
function parseData(data = Object.create(null)) {
	if (typeof data === "string") try {
		return JSON.parse(data);
	} catch (e) {
		console.error("Invalid JSON string provided:", e);
		return Object.create(null);
	}
	return data;
}
/**
* Builds a flat data structure from a nested data object.
*
* @param {Object} data - The nested data object containing components.
* @param {string} componentId - The ID of the component to start building the flat structure from.
* @param {string} componentType - The type of the component to start building the flat structure from.
* @param {Object} [result={}] - The result object to store the flat data structure.
* @returns {Object} The flat data structure with component IDs as keys and component data as values.
*/
function buildFlatDataStructure(data, componentId, componentType, result = {}) {
	if (!componentId || !data[componentType][componentId]) return result;
	const key = `${componentType}.${componentId}`;
	result[key] = data[componentType][componentId];
	const childType = CHILD_TYPE_INDEX_MAP.get(componentType);
	if (childType) {
		const childrenIds = data[componentType][componentId].data?.children || [];
		for (const childId of childrenIds) buildFlatDataStructure(data, childId, childType, result);
	}
	return result;
}
var import_mergeWith, uuidv4, shortId, match, remove, componentType, unique, uuid, merge, clone$1, percent, numToPercent, sessionStorage, isAddress, isInternalAddress, cleanFormData;
var init_utils = __esmMin((() => {
	import_mergeWith = /* @__PURE__ */ __toESM(require_mergeWith(), 1);
	init_constants();
	uuidv4 = () => crypto.randomUUID().slice(0, 8);
	shortId = () => uuidv4().slice(0, 8);
	match = (str = "", filter) => {
		if (!filter) {
			console.warn("utils.match missing argument 2.");
			return false;
		}
		const matchOperators = /[|\\{}()[\]^*$+?.]/g;
		let filterArray = typeof filter === "string" ? [filter] : filter;
		filterArray = filterArray.map((filterStr) => {
			return filterStr === "*" ? "" : filterStr.replace(matchOperators, "\\$&");
		});
		let isMatch = true;
		if (filterArray.length) isMatch = !new RegExp(filterArray.join("|"), "i").exec(str);
		return isMatch;
	};
	remove = (arr, val) => {
		const index = arr.indexOf(val);
		if (index !== -1) arr.splice(index, 1);
	};
	componentType = (node) => {
		const classMatch = node.className?.match(COMPONENT_TYPE_CLASSNAMES_REGEXP);
		return classMatch && COMPONENT_TYPE_CLASSNAMES_LOOKUP[classMatch[0]];
	};
	unique = (array) => Array.from(new Set(array));
	uuid = (elem) => {
		return elem?.attrs?.id || elem?.id || shortId();
	};
	merge = (obj1, obj2) => {
		const customizer = (objValue, srcValue) => {
			if (Array.isArray(objValue)) {
				if (srcValue !== void 0 && srcValue !== null) return unique(objValue.concat(srcValue));
				return srcValue;
			}
			if (Array.isArray(srcValue)) {
				if (objValue !== void 0 && objValue !== null) return unique(srcValue.concat(objValue));
				return srcValue;
			}
		};
		return (0, import_mergeWith.default)({}, obj1, obj2, customizer);
	};
	clone$1 = (obj) => {
		let copy;
		const isPromise = obj instanceof Promise;
		if (obj === null || !(typeof obj === "object") || isPromise) return obj;
		if (obj instanceof Date) {
			copy = /* @__PURE__ */ new Date();
			copy.setTime(obj.getTime());
			return copy;
		}
		if (Array.isArray(obj)) {
			copy = [];
			for (let i = 0, len = obj.length; i < len; i++) copy[i] = clone$1(obj[i]);
			return copy;
		}
		if (obj instanceof Object) {
			copy = {};
			for (const attr in obj) if (Object.hasOwn(obj, attr)) copy[attr] = clone$1(obj[attr]);
			return copy;
		}
		throw new Error("Unable to copy Object, type not supported.");
	};
	percent = (val, total) => val / total * 100;
	numToPercent = (num) => `${num.toString()}%`;
	sessionStorage = Object.create(null, {
		get: { value: (key) => {
			const itemValue = window.sessionStorage?.getItem(key);
			try {
				return JSON.parse(itemValue);
			} catch (_err) {
				return itemValue;
			}
		} },
		set: { value: (key, itemValue) => {
			try {
				return window.sessionStorage?.setItem(key, JSON.stringify(itemValue));
			} catch (error) {
				console.error(error);
			}
		} }
	});
	isAddress = (str) => {
		return /^(stage|row|column|field)s./.test(str);
	};
	isInternalAddress = (str) => {
		return INTERNAL_COMPONENT_INDEX_REGEX.test(str);
	};
	cleanFormData = (formData) => formData ? clone$1(parseData(formData)) : DEFAULT_FORMDATA();
}));
//#endregion
//#region src/lib/icons/formeo-sprite.svg?raw
var formeo_sprite_default;
var init_formeo_sprite = __esmMin((() => {
	formeo_sprite_default = "<?xml version=\"1.0\" encoding=\"utf-8\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"><svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><symbol id=\"f-i-autocomplete\" viewBox=\"0 0 16 16\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M6,5h1v1H6V5z M4,4H3v1h1V4z M6,4H5v1h1V4z M2,5v1h1V5H2z M3,7h1V6H3V7z M5,7h1V6H5V7z M4,5v1h1V5H4z M2,14h1v-1H2V14z M4,14h1v-1H4V14z M6,14h1v-1H6V14z M9,13H8v1h1V13z M16,3.5v4C16,8.3,15.3,9,14.5,9H14v3v3c0,0.6-0.4,1-1,1H1c-0.6,0-1-0.4-1-1V3.5 C0,2.7,0.7,2,1.5,2h3H8V1.5V1H7H6V0.5V0h2.5H11v0.5V1h-1H9v0.5V2h3h2.5C15.3,2,16,2.7,16,3.5z M13,12H7H1v3h12V12z M3,11v-1H2v1H3z M5,11v-1H4v1H5z M15,3.5C15,3.2,14.8,3,14.5,3H9v2.5V8H8.5H8V7.5V7H7V6h1V5.5V5H7V4h1V3.5V3H1.5C1.2,3,1,3.2,1,3.5v4 C1,7.8,1.2,8,1.5,8H8v1H6v0.5V10h2.5H11V9.5V9H9V8h5.5C14.8,8,15,7.8,15,7.5V3.5z\"/></symbol><symbol viewBox=\"0 0 32 32\" id=\"f-i-bin\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M4 10v20c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-20h-22zM10 28h-2v-14h2v14zM14 28h-2v-14h2v14zM18 28h-2v-14h2v14zM22 28h-2v-14h2v14zM26.5 4h-6.5v-2.5c0-.825-.675-1.5-1.5-1.5h-7c-.825 0-1.5.675-1.5 1.5v2.5h-6.5c-.825 0-1.5.675-1.5 1.5v2.5h26v-2.5c0-.825-.675-1.5-1.5-1.5zM18 4h-6v-1.975h6v1.975z\"/></symbol><symbol id=\"f-i-button\" viewBox=\"0 0 16 16\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\"><metadata id=\"acprefix__metadata8\"><rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"><cc:Work rdf:about=\"\" xmlns:cc=\"http://creativecommons.org/ns#\"><dc:format xmlns:dc=\"http://purl.org/dc/elements/1.1/\">image/svg+xml</dc:format><dc:type rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\"/><dc:title xmlns:dc=\"http://purl.org/dc/elements/1.1/\"/></cc:Work></rdf:RDF></metadata><path id=\"acprefix__rect4140\" d=\"M 0.4765625,4 A 0.47706934,0.47706934 0 0 0 0,4.4765625 L 0,11.523438 A 0.47706934,0.47706934 0 0 0 0.4765625,12 L 15.523438,12 A 0.47706934,0.47706934 0 0 0 16,11.523438 L 16,4.4765625 A 0.47706934,0.47706934 0 0 0 15.523438,4 L 0.4765625,4 Z m 0.4765625,0.953125 14.09375,0 0,6.09375 -14.09375,0 0,-6.09375 z\"/><g id=\"acprefix__layer1\"><g id=\"acprefix__text4203\"><g id=\"acprefix__g4212\" transform=\"translate(0.10112835,0.1001358)\"><path id=\"acprefix__path4208\" d=\"m 6.0690374,6.4093857 q -0.5371093,0 -0.8544922,0.4003906 -0.3149414,0.4003906 -0.3149414,1.0913086 0,0.6884766 0.3149414,1.0888672 0.3173829,0.4003906 0.8544922,0.4003906 0.5371094,0 0.8496094,-0.4003906 0.3149414,-0.4003906 0.3149414,-1.0888672 0,-0.690918 -0.3149414,-1.0913086 -0.3125,-0.4003906 -0.8496094,-0.4003906 z m 0,-0.4003906 q 0.7666016,0 1.225586,0.5151367 0.4589843,0.5126953 0.4589843,1.3769531 0,0.8618164 -0.4589843,1.3769531 -0.4589844,0.5126953 -1.225586,0.5126953 -0.7690429,0 -1.2304687,-0.5126953 -0.4589844,-0.5126953 -0.4589844,-1.3769531 0,-0.8642578 0.4589844,-1.3769531 0.4614258,-0.5151367 1.2304687,-0.5151367 z\"/><path id=\"acprefix__path4210\" d=\"m 8.5250921,6.074913 0.4931641,0 0,1.5405274 1.6357418,-1.5405274 0.634766,0 -1.809082,1.6992188 1.938477,1.9458008 -0.649415,0 -1.7504878,-1.7553711 0,1.7553711 -0.4931641,0 0,-3.6450196 z\"/></g></g></g></symbol><symbol viewBox=\"0 0 32 32\" id=\"f-i-calendar\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12.048 16.961c-0.178 0.257-0.395 0.901-0.652 1.059-0.257 0.157-0.547 0.267-0.869 0.328-0.323 0.062-0.657 0.089-1.002 0.079v1.527h2.467v6.046h1.991v-9.996h-1.584c-0.056 0.381-0.173 0.7-0.351 0.957zM23 8h2c0.553 0 1-0.448 1-1v-6c0-0.552-0.447-1-1-1h-2c-0.553 0-1 0.448-1 1v6c0 0.552 0.447 1 1 1zM7 8h2c0.552 0 1-0.448 1-1v-6c0-0.552-0.448-1-1-1h-2c-0.552 0-1 0.448-1 1v6c0 0.552 0.448 1 1 1zM30 4h-2v5c0 0.552-0.447 1-1 1h-6c-0.553 0-1-0.448-1-1v-5h-8v5c0 0.552-0.448 1-1 1h-6c-0.552 0-1-0.448-1-1v-5h-2c-1.104 0-2 0.896-2 2v24c0 1.104 0.896 2 2 2h28c1.104 0 2-0.896 2-2v-24c0-1.104-0.896-2-2-2zM30 29c0 0.553-0.447 1-1 1h-26c-0.552 0-1-0.447-1-1v-16c0-0.552 0.448-1 1-1h26c0.553 0 1 0.448 1 1v16zM15.985 17.982h4.968c-0.936 1.152-1.689 2.325-2.265 3.705-0.575 1.381-0.638 2.818-0.749 4.312h2.131c0.009-0.666-0.195-1.385-0.051-2.156 0.146-0.771 0.352-1.532 0.617-2.285 0.267-0.752 0.598-1.461 0.996-2.127 0.396-0.667 0.853-1.229 1.367-1.686v-1.742h-7.015v1.979z\"/></symbol><symbol id=\"f-i-checkbox\" viewBox=\"0 0 16 16\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M13.5,5v8c0,0.8-0.7,1.5-1.5,1.5H3c-0.8,0-1.5-0.7-1.5-1.5V4c0-0.8,0.7-1.5,1.5-1.5h9c0.7,0,1.3,0.5,1.5,1.2l2.4-1.4L13.5,5 z M12.5,6.2L7.7,12L2.8,5.5l4.9,1.6l4.8-2.9V4c0-0.3-0.2-0.5-0.5-0.5H3C2.7,3.5,2.5,3.7,2.5,4v9c0,0.3,0.2,0.5,0.5,0.5h9 c0.3,0,0.5-0.2,0.5-0.5V6.2z\"/></symbol><symbol id=\"f-i-checkbox-group\" viewBox=\"0 0 16 16\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M0,1h16V0H0V1z M0,3h16V2H0V3z M6,5v1h9V5H6z M15,14v-1H6v1H15z M6,10h9V9H6V10z M4,12l-2.5,1.5L0,13l1.5,2L4,12z M4,8 L1.5,9.5L0,9l1.5,2L4,8z M4,4L1.5,5.5L0,5l1.5,2L4,4z\"/></symbol><symbol xml:space=\"preserve\" viewBox=\"0 0 16 16\" id=\"f-i-columns\" xmlns=\"http://www.w3.org/2000/svg\"><metadata id=\"agprefix__metadata4318\"><rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"><cc:Work rdf:about=\"\" xmlns:cc=\"http://creativecommons.org/ns#\"><dc:format xmlns:dc=\"http://purl.org/dc/elements/1.1/\">image/svg+xml</dc:format><dc:type rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\"/><dc:title xmlns:dc=\"http://purl.org/dc/elements/1.1/\"/></cc:Work></rdf:RDF></metadata><path id=\"agprefix__rect4860-3-5\" d=\"M 16,0.5 A 0.50004997,0.50004997 0 0 0 15.5,0 l -5,0 -5,0 -5,0 A 0.50004997,0.50004997 0 0 0 0,0.5 l 0,15 A 0.50004997,0.50004997 0 0 0 0.5,16 l 5,0 5,0 5,0 A 0.50004997,0.50004997 0 0 0 16,15.5 l 0,-15 z M 15,1 15,15 11,15 11,1 15,1 Z M 10,1 10,15 6,15 6,1 10,1 Z M 5,1 5,15 1,15 1,1 5,1 Z\"/></symbol><symbol viewBox=\"0 0 32 32\" id=\"f-i-copy\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M20 8v-8h-14l-6 6v18h12v8h20v-24h-12zM6 2.828v3.172h-3.172l3.172-3.172zM2 22v-14h6v-6h10v6l-6 6v8h-10zM18 10.828v3.172h-3.172l3.172-3.172zM30 30h-16v-14h6v-6h10v20z\"/></symbol><symbol id=\"f-i-divider\" viewBox=\"0 0 15 15\" xmlns=\"http://www.w3.org/2000/svg\"><metadata id=\"aiprefix__metadata10\"><rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"><cc:Work rdf:about=\"\" xmlns:cc=\"http://creativecommons.org/ns#\"><dc:format xmlns:dc=\"http://purl.org/dc/elements/1.1/\">image/svg+xml</dc:format><dc:type rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\"/><dc:title xmlns:dc=\"http://purl.org/dc/elements/1.1/\"/></cc:Work></rdf:RDF></metadata><rect y=\"7\" x=\"0\" height=\"1\" width=\"15\" id=\"aiprefix__rect4182\"/></symbol><symbol viewBox=\"0 0 28 32\" id=\"f-i-edit\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M22 2l-4 4 6 6 4-4-6-6zM0 24l0.021 6.018 5.979-0.018 16-16-6-6-16 16zM6 28h-4v-4h2v2h2v2z\"/></symbol><symbol fill=\"#000000\" viewBox=\"0 0 24 24\" id=\"f-i-email\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12,2 C17.4292399,2 21.8479317,6.32667079 21.9961582,11.7200952 L22,12 L22,13 C22,15.1729208 20.477434,17 18.5,17 C17.3269391,17 16.3139529,16.3570244 15.6839382,15.3803024 C14.770593,16.3757823 13.4581934,17 12,17 C9.23857625,17 7,14.7614237 7,12 C7,9.23857625 9.23857625,7 12,7 C14.6887547,7 16.8818181,9.12230671 16.9953805,11.7831104 L17,12 L17,13 C17,14.1407877 17.7160103,15 18.5,15 C19.2447902,15 19.928229,14.2245609 19.9947109,13.1689341 L20,13 L20,12 C20,7.581722 16.418278,4 12,4 C7.581722,4 4,7.581722 4,12 C4,16.418278 7.581722,20 12,20 C13.1630948,20 14.2892822,19.7522618 15.3225159,19.2798331 C15.8247876,19.0501777 16.4181317,19.271177 16.647787,19.7734487 C16.8774423,20.2757205 16.656443,20.8690646 16.1541713,21.0987199 C14.861218,21.689901 13.4515463,22 12,22 C6.4771525,22 2,17.5228475 2,12 C2,6.4771525 6.4771525,2 12,2 Z M12,9 C10.3431458,9 9,10.3431458 9,12 C9,13.6568542 10.3431458,15 12,15 C13.6568542,15 15,13.6568542 15,12 C15,10.3431458 13.6568542,9 12,9 Z\"/></symbol><symbol viewBox=\"0 0 32 32\" id=\"f-i-floppy-disk\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M28 0h-28v32h32v-28l-4-4zM16 4h4v8h-4v-8zM28 28h-24v-24h2v10h18v-10h2.343l1.657 1.657v22.343z\"/></symbol><symbol xml:space=\"preserve\" viewBox=\"0 0 16 16\" id=\"f-i-handle\" xmlns=\"http://www.w3.org/2000/svg\"><metadata id=\"aqprefix__metadata8\"><rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"><cc:Work rdf:about=\"\" xmlns:cc=\"http://creativecommons.org/ns#\"><dc:format xmlns:dc=\"http://purl.org/dc/elements/1.1/\">image/svg+xml</dc:format><dc:type rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\"/><dc:title xmlns:dc=\"http://purl.org/dc/elements/1.1/\"/></cc:Work></rdf:RDF></metadata><g transform=\"translate(0,-2)\" id=\"aqprefix__g4220\"><rect id=\"aqprefix__rect4191\" width=\"2\" height=\"2\" x=\"2\" y=\"7\"/><rect id=\"aqprefix__rect4191-2\" width=\"2\" height=\"2\" x=\"7\" y=\"7\"/><rect id=\"aqprefix__rect4191-4\" width=\"2\" height=\"2\" x=\"12\" y=\"7\"/></g><g transform=\"translate(0,2)\" id=\"aqprefix__g4220-6\"><rect id=\"aqprefix__rect4191-40\" width=\"2\" height=\"2\" x=\"2\" y=\"7\"/><rect id=\"aqprefix__rect4191-2-3\" width=\"2\" height=\"2\" x=\"7\" y=\"7\"/><rect id=\"aqprefix__rect4191-4-9\" width=\"2\" height=\"2\" x=\"12\" y=\"7\"/></g></symbol><symbol xml:space=\"preserve\" viewBox=\"0 0 16 16\" id=\"f-i-handle-column\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M2 7h2v2H2zM7 7h2v2H7zM12 7h2v2h-2zM2 12h2v2H2zM7 12h2v2H7zM12 12h2v2h-2z\" transform=\"rotate(90 9.25 9.25)\"/></symbol><symbol xml:space=\"preserve\" viewBox=\"0 0 16 16\" id=\"f-i-handle-field\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M9.5-6.5h2v2h-2zm-5 0h2v2h-2zm5-5h2v2h-2zm-5 0h2v2h-2z\" transform=\"rotate(90)\"/></symbol><symbol xml:space=\"preserve\" viewBox=\"0 0 16 16\" id=\"f-i-handle-row\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 9.5h2v2h-2zm-5 0h2v2H7Zm-5 0h2v2H2Zm10-5h2v2h-2zm-5 0h2v2H7Zm-5 0h2v2H2Z\"/></symbol><symbol xml:space=\"preserve\" viewBox=\"0 0 16 16\" id=\"f-i-handle-stage\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M2 4.5h2v2H2zM7 4.5h2v2H7zM12 4.5h2v2h-2zM2 9.5h2v2H2zM7 9.5h2v2H7zM12 9.5h2v2h-2zM2-.5h2v2H2zM7-.5h2v2H7zM12-.5h2v2h-2z\" transform=\"translate(0 2.5)\"/></symbol><symbol viewBox=\"0 0 448 512\" id=\"f-i-hash\" xmlns=\"http://www.w3.org/2000/svg\"><g id=\"arprefix__icomoon-ignore\"/><path fill=\"#000\" d=\"M448 192v-64h-80.064l16-128h-64l-16 128h-127.968l16-128h-64l-16 128h-111.968v64h103.968l-15.968 128h-88v64h80l-16 128h64l16-128h127.968l-16 128h64.032l16-128h112v-64h-104l15.936-128h88.064zM279.968 320h-127.968l15.968-128h127.968l-15.968 128z\"/></symbol><symbol viewBox=\"0 0 28 28\" id=\"f-i-header\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"#444\" d=\"M26.281 26q-0.688 0-2.070-0.055t-2.086-0.055q-0.688 0-2.063 0.055t-2.063 0.055q-0.375 0-0.578-0.32t-0.203-0.711q0-0.484 0.266-0.719t0.609-0.266 0.797-0.109 0.703-0.234q0.516-0.328 0.516-2.188l-0.016-6.109q0-0.328-0.016-0.484-0.203-0.063-0.781-0.063h-10.547q-0.594 0-0.797 0.063-0.016 0.156-0.016 0.484l-0.016 5.797q0 2.219 0.578 2.562 0.25 0.156 0.75 0.203t0.891 0.055 0.703 0.234 0.313 0.711q0 0.406-0.195 0.75t-0.57 0.344q-0.734 0-2.18-0.055t-2.164-0.055q-0.672 0-2 0.055t-1.984 0.055q-0.359 0-0.555-0.328t-0.195-0.703q0-0.469 0.242-0.703t0.562-0.273 0.742-0.117 0.656-0.234q0.516-0.359 0.516-2.234l-0.016-0.891v-12.703q0-0.047 0.008-0.406t0-0.57-0.023-0.602-0.055-0.656-0.102-0.57-0.172-0.492-0.25-0.281q-0.234-0.156-0.703-0.187t-0.828-0.031-0.641-0.219-0.281-0.703q0-0.406 0.187-0.75t0.562-0.344q0.719 0 2.164 0.055t2.164 0.055q0.656 0 1.977-0.055t1.977-0.055q0.391 0 0.586 0.344t0.195 0.75q0 0.469-0.266 0.68t-0.602 0.227-0.773 0.063-0.672 0.203q-0.547 0.328-0.547 2.5l0.016 5q0 0.328 0.016 0.5 0.203 0.047 0.609 0.047h10.922q0.391 0 0.594-0.047 0.016-0.172 0.016-0.5l0.016-5q0-2.172-0.547-2.5-0.281-0.172-0.914-0.195t-1.031-0.203-0.398-0.773q0-0.406 0.195-0.75t0.586-0.344q0.688 0 2.063 0.055t2.063 0.055q0.672 0 2.016-0.055t2.016-0.055q0.391 0 0.586 0.344t0.195 0.75q0 0.469-0.273 0.688t-0.625 0.227-0.805 0.047-0.688 0.195q-0.547 0.359-0.547 2.516l0.016 14.734q0 1.859 0.531 2.188 0.25 0.156 0.719 0.211t0.836 0.070 0.648 0.242 0.281 0.695q0 0.406-0.187 0.75t-0.562 0.344z\"/></symbol><symbol xml:space=\"preserve\" viewBox=\"0 0 16 16\" id=\"f-i-hidden\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M0 12h1v-1H0Zm15-7h1V4h-1zm-1 7h1v-1h-1zm-2 0h1v-1h-1zm-2 0h1v-1h-1Zm-2 0h1v-1H8Zm-2 0h1v-1H6Zm-2 0h1v-1H4Zm-2 0h1v-1H2Zm13-1h1v-1h-1ZM0 10h1V9H0Zm15-1h1V8h-1ZM0 8h1V7H0Zm15-1h1V6h-1ZM0 6h1V5H0Zm13-1h1V4h-1zm-2 0h1V4h-1ZM9 5h1V4H9ZM7 5h1V4H7ZM5 5h1V4H5ZM3 5h1V4H3ZM1 5h1V4H1Z\"/></symbol><symbol xml:space=\"preserve\" viewBox=\"0 0 32 32\" id=\"f-i-info-circle\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"m17.962 24.725 1.806.096v2.531h-7.534v-2.406l1.045-.094c.568-.063.916-.254.916-1.014v-8.801c0-.699-.188-.92-.791-.92l-1.106-.062v-2.626h5.666zM15.747 4.648c1.394 0 2.405 1.047 2.405 2.374 0 1.331-1.014 2.313-2.438 2.313-1.454 0-2.404-.982-2.404-2.313 0-1.327.95-2.374 2.437-2.374M16 32C7.178 32 0 24.822 0 16S7.178 0 16 0c8.82 0 16 7.178 16 16s-7.18 16-16 16m0-29C8.832 3 3 8.832 3 16s5.832 13 13 13 13-5.832 13-13S23.168 3 16 3\"/></symbol><symbol viewBox=\"0 0 384 512\" id=\"f-i-menu\" xmlns=\"http://www.w3.org/2000/svg\"><g id=\"avprefix__icomoon-ignore\"/><path d=\"M0 96v64h384v-64h-384zM0 288h384v-64h-384v64zM0 416h384v-64h-384v64z\"/></symbol><symbol viewBox=\"0 0 24 24\" fill=\"none\" id=\"f-i-minus\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M6 12L18 12\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></symbol><symbol viewBox=\"0 0 512 512\" id=\"f-i-move\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M287.744 94.736v129.008h128v-64l96.256 96.256-96.256 96.24v-65.488h-128v129.008h64.496l-96.24 96.24-96.256-96.24h64v-129.008h-128v64.992l-95.744-95.744 95.744-95.744v63.488h128v-129.008h-62.496l94.752-94.736 94.752 94.736h-63.008z\"/></symbol><symbol viewBox=\"0 0 512 512\" id=\"f-i-move-vertical\" xmlns=\"http://www.w3.org/2000/svg\"><metadata id=\"axprefix__metadata10\"><rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"><cc:Work rdf:about=\"\" xmlns:cc=\"http://creativecommons.org/ns#\"><dc:format xmlns:dc=\"http://purl.org/dc/elements/1.1/\">image/svg+xml</dc:format><dc:type rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\"/><dc:title xmlns:dc=\"http://purl.org/dc/elements/1.1/\"/></cc:Work></rdf:RDF></metadata><sodipodi:namedview pagecolor=\"#ffffff\" bordercolor=\"#666666\" borderopacity=\"1\" objecttolerance=\"10\" gridtolerance=\"10\" guidetolerance=\"10\" xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\" inkscape:pageopacity=\"0\" inkscape:pageshadow=\"2\" inkscape:window-width=\"3440\" inkscape:window-height=\"1416\" id=\"axprefix__namedview6\" showgrid=\"false\" inkscape:zoom=\"1.84375\" inkscape:cx=\"421.4312\" inkscape:cy=\"218.56484\" inkscape:window-x=\"0\" inkscape:window-y=\"24\" inkscape:window-maximized=\"1\" inkscape:current-layer=\"svg2\" xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"/><path d=\"m 287.744,94.736 0,321.024 64.496,0 L 256,512 l -96.256,-96.24 64,0 0,-321.024 -62.496,0 L 256,0 350.752,94.736 Z\" id=\"axprefix__path4\" xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\" inkscape:connector-curvature=\"0\" xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\" sodipodi:nodetypes=\"ccccccccccc\"/></symbol><symbol viewBox=\"0 0 20 28\" id=\"f-i-paragraph\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"#444\" d=\"M19.969 2.953v1.141q0 0.453-0.289 0.953t-0.664 0.5q-0.781 0-0.844 0.016-0.406 0.094-0.5 0.484-0.047 0.172-0.047 1v18q0 0.391-0.281 0.672t-0.672 0.281h-1.687q-0.391 0-0.672-0.281t-0.281-0.672v-19.031h-2.234v19.031q0 0.391-0.273 0.672t-0.68 0.281h-1.687q-0.406 0-0.68-0.281t-0.273-0.672v-7.75q-2.297-0.187-3.828-0.922-1.969-0.906-3-2.797-1-1.828-1-4.047 0-2.594 1.375-4.469 1.375-1.844 3.266-2.484 1.734-0.578 6.516-0.578h7.484q0.391 0 0.672 0.281t0.281 0.672z\"/></symbol><symbol id=\"f-i-phone-receiver\" viewBox=\"0 0 578.106 578.106\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\"><g><g><path d=\"M577.83,456.128c1.225,9.385-1.635,17.545-8.568,24.48l-81.396,80.781 c-3.672,4.08-8.465,7.551-14.381,10.404c-5.916,2.857-11.729,4.693-17.439,5.508c-0.408,0-1.635,0.105-3.676,0.309 c-2.037,0.203-4.689,0.307-7.953,0.307c-7.754,0-20.301-1.326-37.641-3.979s-38.555-9.182-63.645-19.584 c-25.096-10.404-53.553-26.012-85.376-46.818c-31.823-20.805-65.688-49.367-101.592-85.68 c-28.56-28.152-52.224-55.08-70.992-80.783c-18.768-25.705-33.864-49.471-45.288-71.299 c-11.425-21.828-19.993-41.616-25.705-59.364S4.59,177.362,2.55,164.51s-2.856-22.95-2.448-30.294 c0.408-7.344,0.612-11.424,0.612-12.24c0.816-5.712,2.652-11.526,5.508-17.442s6.324-10.71,10.404-14.382L98.022,8.756 c5.712-5.712,12.24-8.568,19.584-8.568c5.304,0,9.996,1.53,14.076,4.59s7.548,6.834,10.404,11.322l65.484,124.236 c3.672,6.528,4.692,13.668,3.06,21.42c-1.632,7.752-5.1,14.28-10.404,19.584l-29.988,29.988c-0.816,0.816-1.53,2.142-2.142,3.978 s-0.918,3.366-0.918,4.59c1.632,8.568,5.304,18.36,11.016,29.376c4.896,9.792,12.444,21.726,22.644,35.802 s24.684,30.293,43.452,48.653c18.36,18.77,34.68,33.354,48.96,43.76c14.277,10.4,26.215,18.053,35.803,22.949 c9.588,4.896,16.932,7.854,22.031,8.871l7.648,1.531c0.816,0,2.145-0.307,3.979-0.918c1.836-0.613,3.162-1.326,3.979-2.143 l34.883-35.496c7.348-6.527,15.912-9.791,25.705-9.791c6.938,0,12.443,1.223,16.523,3.672h0.611l118.115,69.768 C571.098,441.238,576.197,447.968,577.83,456.128z\"/></g></g><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/></symbol><symbol viewBox=\"0 0 24 24\" fill=\"none\" id=\"f-i-plus\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M6 12H18M12 6V18\" stroke=\"#000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></symbol><symbol id=\"f-i-radio-group\" viewBox=\"0 0 16 16\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M0,1h16V0H0V1z M0,3h16V2H0V3z M5,6h10V5H5V6z M15,9H5v1h10V9z M15,14v-1H5v1H15z M1.5,7C0.7,7,0,6.3,0,5.5S0.7,4,1.5,4 S3,4.7,3,5.5S2.3,7,1.5,7z M1.5,5C1.2,5,1,5.2,1,5.5S1.2,6,1.5,6S2,5.8,2,5.5S1.8,5,1.5,5z M1.5,11.1C0.7,11.1,0,10.4,0,9.6 s0.7-1.5,1.5-1.5S3,8.7,3,9.6S2.3,11.1,1.5,11.1z M1.5,9.1C1.2,9.1,1,9.3,1,9.6s0.2,0.5,0.5,0.5S2,9.8,2,9.6S1.8,9.1,1.5,9.1z M1.5,15C0.7,15,0,14.3,0,13.5S0.7,12,1.5,12S3,12.7,3,13.5S2.3,15,1.5,15z M1.5,13C1.2,13,1,13.2,1,13.5S1.2,14,1.5,14 S2,13.8,2,13.5S1.8,13,1.5,13z\"/></symbol><symbol viewBox=\"0 0 512 512\" id=\"f-i-remove\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M193.694-139.2h87.322v510.916h-87.322zM-18.103 159.92V72.597h510.915v87.322z\" transform=\"rotate(45 77.994 208.636)\"/></symbol><symbol id=\"f-i-rich-text\" viewBox=\"0 0 16 16\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M15,1H1C0.4,1,0,1.4,0,2v12c0,0.6,0.4,1,1,1h14c0.6,0,1-0.4,1-1V2C16,1.4,15.6,1,15,1z M1,3.1h0.8v0.3H1V3.1z M1,3.6h0.8 v0.3H1V3.6z M15,14H1V5.1h14V14z M15,4.9H1V4.6h14V4.9z M15,4.4H1V4.1h0.8v0.2h1.5V4.1h1.3v0.2H6V4.1h1.3v0.2h1.5V4.1H10v0.2h1.5 V4.1h1.3v0.2h1.5V4.1H15V4.4z M4.5,3.6v0.3H3.3V3.6H4.5z M3.3,3.4V3.1h1.3v0.3H3.3z M7.3,3.6v0.3H6V3.6H7.3z M6,3.4V3.1h1.3v0.3H6z M10,3.6v0.3H8.8V3.6H10z M8.8,3.4V3.1H10v0.3H8.8z M12.8,3.6v0.3h-1.3V3.6H12.8z M11.5,3.4V3.1h1.3v0.3H11.5z M15,3.9h-0.8V3.6H15 V3.9z M15,3.4h-0.8V3.1H15V3.4z M15,2.9h-0.8V2.8h-1.5v0.2h-1.3V2.8H10v0.2H8.8V2.8H7.3v0.2H6V2.8H4.5v0.2H3.3V2.8H1.8v0.2H1V2.6h14 V2.9z M15,2.4H1V2.1h14V2.4z M3,12v-1h10v1H3z M13,10H3V9h10V10z M11,8H3V7h8V8z\"/></symbol><symbol xml:space=\"preserve\" viewBox=\"0 0 16 16\" id=\"f-i-rows\" xmlns=\"http://www.w3.org/2000/svg\"><metadata id=\"bfprefix__metadata4318\"><rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"><cc:Work rdf:about=\"\" xmlns:cc=\"http://creativecommons.org/ns#\"><dc:format xmlns:dc=\"http://purl.org/dc/elements/1.1/\">image/svg+xml</dc:format><dc:type rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\"/><dc:title xmlns:dc=\"http://purl.org/dc/elements/1.1/\"/></cc:Work></rdf:RDF></metadata><g transform=\"matrix(0,1,-1,0,3.0984025,11.835155)\" id=\"bfprefix__g7209\"><path id=\"bfprefix__rect4860-3-5\" d=\"m 4.1640625,-12.402344 a 0.50004997,0.50004997 0 0 0 -0.5,-0.5 l -5,0 -5,0 -5.0000005,0 a 0.50004997,0.50004997 0 0 0 -0.5,0.5 l 0,15.0000002 a 0.50004997,0.50004997 0 0 0 0.5,0.5 l 4.9648442,0 a 0.50004997,0.50004997 0 0 0 0.035156,0 l 4.9648437,0 a 0.50004997,0.50004997 0 0 0 0.035156,0 l 5,0 a 0.50004997,0.50004997 0 0 0 0.5,-0.5 l 0,-15.0000002 z m -1,0.5 0,14.0000002 -4,0 0,-14.0000002 4,0 z m -5,0 0,14.0000002 -4,0 0,-14.0000002 4,0 z m -5,0 0,14.0000002 -4.0000005,0 0,-14.0000002 4.0000005,0 z\"/></g></symbol><symbol id=\"f-i-select\" viewBox=\"0 0 16 16\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\"><path id=\"bgprefix__XMLID_1_\" d=\"M0,0v14h0c0,0.6,0.4,1,1,1h10c0.6,0,1-0.4,1-1h0V5h4V0H0z M1,1h10v3H1V1z M1,7h10v3H1V7z M1,14v-3h10v3H1z M15,4h-3V1h3V4z M2,2h1v1H2V2z M2,12h1v1H2V12z M4,12h1v1H4V12z M6,12h1v1H6V12z M9,12v1H8v-1H9z M2,8h1v1H2V8z M4,8h1v1H4V8z M6,8 h1v1H6V8z M13.5,3.1l-1-1.1h1.9L13.5,3.1z M2,6V5h1v1H2L2,6z M4,6V5h1v1H4L4,6z\"/></symbol><symbol viewBox=\"0 0 448 512\" id=\"f-i-settings\" xmlns=\"http://www.w3.org/2000/svg\"><g id=\"bhprefix__icomoon-ignore\"/><path d=\"M223.969 175c-44.703 0-80.969 36.266-80.969 81 0 44.688 36.266 81.031 80.969 81.031 44.719 0 80.719-36.344 80.719-81.031-0-44.734-36-81-80.719-81zM386.313 302.531l-14.594 35.156 29.469 57.875-36.094 36.094-59.218-27.969-35.156 14.438-17.844 54.625-2.281 7.25h-51.016l-22.078-61.656-35.156-14.5-57.952 29.344-36.078-36.063 27.938-59.25-14.484-35.125-61.767-20.156v-50.984l61.703-22.109 14.485-35.094-25.953-51.234-3.422-6.719 36.031-36.031 59.297 27.922 35.109-14.516 17.828-54.594 2.297-7.234h51l22.094 61.734 35.063 14.516 58.031-29.406 36.063 36.031-27.938 59.203 14.438 35.172 61.875 20.125v50.969l-61.688 22.187z\"/></symbol><symbol id=\"f-i-text-input\" viewBox=\"0 0 16 16\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\"><path id=\"biprefix__XMLID_10_\" d=\"M15,4H4.5V3H6V2H4.5h-1H2v1h1.5v1H1C0.4,4,0,4.5,0,5v6c0,0.6,0.4,1,1,1h2.5v1H2v1h4v-1H4.5v-1H15 c0.6,0,1-0.4,1-1V5C16,4.5,15.6,4,15,4z M1,11V5h2.5v6H1z M15,11H4.5V5H15V11z\"/></symbol><symbol id=\"f-i-textarea\" viewBox=\"0 0 16 16\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\"><path id=\"bjprefix__XMLID_1_\" d=\"M3,11v-1h8v1H3L3,11z M3,7h10V6H3V7L3,7z M3,8v1h10V8H3L3,8z M13,4H3v1h10V4L13,4z M16,14V2c0-0.6-0.4-1-1-1 H1C0.4,1,0,1.4,0,2v12c0,0.6,0.4,1,1,1h14C15.6,15,16,14.6,16,14z M15,2v12H1V2H15z\"/></symbol><symbol viewBox=\"0 0 24 32\" id=\"f-i-triangle-down\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"#444\" d=\"M0 12l11.992 11.992 11.992-11.992h-23.984z\"/></symbol><symbol viewBox=\"0 0 12 32\" id=\"f-i-triangle-left\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"#444\" d=\"M0 15.996l11.992 11.992v-23.984l-11.992 11.992z\"/></symbol><symbol viewBox=\"0 0 12 32\" id=\"f-i-triangle-right\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"#444\" d=\"M0.002 4.008l11.992 11.992-11.992 11.992v-23.984z\"/></symbol><symbol viewBox=\"0 0 24 32\" id=\"f-i-triangle-up\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"#444\" d=\"M11.992 8l-11.992 11.992h23.984l-11.992-11.992z\"/></symbol><symbol viewBox=\"0 0 512 512\" id=\"f-i-upload\" xmlns=\"http://www.w3.org/2000/svg\"><g id=\"boprefix__icomoon-ignore\"/><path d=\"M240 352h-240v128h480v-128h-240zM448 416h-64v-32h64v32zM112 160l128-128 128 128h-80v160h-96v-160z\"/></symbol></svg>";
})), name, version$1, PACKAGE_NAME, formeoSpriteId, FALLBACK_SVG_SPRITE_URL, CSS_URL, FALLBACK_CSS_URL, PANEL_CLASSNAME, CONTROL_GROUP_CLASSNAME, STAGE_CLASSNAME, ROW_CLASSNAME, COLUMN_CLASSNAME, FIELD_CLASSNAME, CUSTOM_COLUMN_OPTION_CLASSNAME, COLUMN_PRESET_CLASSNAME, COLUMN_RESIZE_CLASSNAME, CHILD_CLASSNAME_MAP, INTERNAL_COMPONENT_TYPES, INTERNAL_COMPONENT_INDEX_TYPES, INTERNAL_COMPONENT_INDEX_REGEX, COMPONENT_TYPES, COMPONENT_INDEX_TYPES, COMPONENT_INDEX_TYPE_MAP, COMPONENT_TYPE_MAP, COMPONENT_TYPE_CONFIGS, COMPONENT_TYPE_CLASSNAMES, COMPONENT_TYPE_CLASSNAMES_LOOKUP, COMPONENT_TYPE_CLASSNAMES_ARRAY, COMPONENT_TYPE_CLASSNAMES_REGEXP, childTypeMapVals, childTypeIndexMapVals, parentTypeMap, CHILD_TYPE_MAP, CHILD_TYPE_INDEX_MAP, PARENT_TYPE_MAP, columnTemplates, COLUMN_TEMPLATES, SESSION_FORMDATA_KEY, SESSION_LOCALE_KEY, ANIMATION_SPEED_FAST, ANIMATION_SPEED_SLOW, EVENT_FORMEO_SAVED, EVENT_FORMEO_UPDATED, EVENT_FORMEO_CHANGED, EVENT_FORMEO_UPDATED_STAGE, EVENT_FORMEO_UPDATED_ROW, EVENT_FORMEO_UPDATED_COLUMN, EVENT_FORMEO_UPDATED_FIELD, EVENT_FORMEO_CLEARED, EVENT_FORMEO_ON_RENDER, EVENT_FORMEO_CONDITION_UPDATED, EVENT_FORMEO_ADDED_ROW, EVENT_FORMEO_ADDED_COLUMN, EVENT_FORMEO_ADDED_FIELD, EVENT_FORMEO_REMOVED_ROW, EVENT_FORMEO_REMOVED_COLUMN, EVENT_FORMEO_REMOVED_FIELD, COMPARISON_OPERATORS, LOGICAL_OPERATORS, ASSIGNMENT_OPERATORS, CONDITION_INPUT_ORDER, CHECKABLE_OPTIONS, VISIBLE_OPTIONS, PROPERTY_OPTIONS, OPERATORS, conditionTypeThen, CONDITION_TEMPLATE, UUID_REGEXP, bsColRegExp, iconPrefix, DEFAULT_FORMDATA, CHECKED_TYPES, REVERSED_CHECKED_TYPES, FILTERED_PANEL_DATA_KEYS;
var init_constants = __esmMin((() => {
	init_package();
	init_utils();
	init_formeo_sprite();
	name = package_default.name;
	version$1 = package_default.version;
	PACKAGE_NAME = name;
	formeoSpriteId = "formeo-sprite";
	FALLBACK_SVG_SPRITE_URL = `https://cdn.jsdelivr.net/npm/formeo@${version$1}/dist/${formeoSpriteId}.svg`;
	CSS_URL = `https://cdn.jsdelivr.net/npm/formeo@${version$1}/dist/formeo.min.css`;
	FALLBACK_CSS_URL = "https://draggable.github.io/formeo/assets/css/formeo.min.css";
	PANEL_CLASSNAME = "f-panel";
	CONTROL_GROUP_CLASSNAME = "control-group";
	STAGE_CLASSNAME = `${PACKAGE_NAME}-stage`;
	ROW_CLASSNAME = `${PACKAGE_NAME}-row`;
	COLUMN_CLASSNAME = `${PACKAGE_NAME}-column`;
	FIELD_CLASSNAME = `${PACKAGE_NAME}-field`;
	CUSTOM_COLUMN_OPTION_CLASSNAME = "custom-column-widths";
	COLUMN_PRESET_CLASSNAME = "column-preset";
	COLUMN_RESIZE_CLASSNAME = "resizing-columns";
	CHILD_CLASSNAME_MAP = new Map([
		[STAGE_CLASSNAME, ROW_CLASSNAME],
		[ROW_CLASSNAME, COLUMN_CLASSNAME],
		[COLUMN_CLASSNAME, FIELD_CLASSNAME]
	]);
	INTERNAL_COMPONENT_TYPES = [
		"stage",
		"row",
		"column",
		"field"
	];
	INTERNAL_COMPONENT_INDEX_TYPES = INTERNAL_COMPONENT_TYPES.map((type) => `${type}s`);
	new Map(INTERNAL_COMPONENT_INDEX_TYPES.map((type, index) => [type, INTERNAL_COMPONENT_TYPES[index]]));
	INTERNAL_COMPONENT_INDEX_REGEX = new RegExp(`^${INTERNAL_COMPONENT_INDEX_TYPES.join("|")}.`);
	COMPONENT_TYPES = [...INTERNAL_COMPONENT_TYPES];
	COMPONENT_INDEX_TYPES = [...INTERNAL_COMPONENT_INDEX_TYPES];
	COMPONENT_INDEX_TYPE_MAP = new Map(COMPONENT_INDEX_TYPES.map((type, index) => [type, COMPONENT_TYPES[index]]));
	new RegExp(`^${COMPONENT_INDEX_TYPES.join("|")}.`);
	COMPONENT_TYPE_MAP = COMPONENT_TYPES.reduce((acc, type) => {
		acc[type] = type;
		return acc;
	}, {});
	COMPONENT_TYPE_CONFIGS = [
		{
			name: "controls",
			className: CONTROL_GROUP_CLASSNAME
		},
		{
			name: "stage",
			className: STAGE_CLASSNAME
		},
		{
			name: "row",
			className: ROW_CLASSNAME
		},
		{
			name: "column",
			className: COLUMN_CLASSNAME
		},
		{
			name: "field",
			className: FIELD_CLASSNAME
		}
	];
	COMPONENT_TYPE_CLASSNAMES = {
		controls: CONTROL_GROUP_CLASSNAME,
		stage: STAGE_CLASSNAME,
		row: ROW_CLASSNAME,
		column: COLUMN_CLASSNAME,
		field: FIELD_CLASSNAME
	};
	COMPONENT_TYPE_CLASSNAMES_LOOKUP = Object.entries(COMPONENT_TYPE_CLASSNAMES).reduce((acc, [type, className]) => {
		acc[className] = type;
		return acc;
	}, {});
	COMPONENT_TYPE_CLASSNAMES_ARRAY = Object.values(COMPONENT_TYPE_CLASSNAMES);
	COMPONENT_TYPE_CLASSNAMES_REGEXP = new RegExp(`${COMPONENT_TYPE_CLASSNAMES_ARRAY.join("|")}`, "g");
	({childTypeMapVals, childTypeIndexMapVals} = COMPONENT_TYPE_CONFIGS.reduce((acc, { name }, index, arr) => {
		const { name: childName } = arr[index + 1] || {};
		if (childName) {
			acc.childTypeMapVals.push([name, childName]);
			acc.childTypeIndexMapVals.push([`${name}s`, `${childName}s`]);
		}
		return acc;
	}, {
		childTypeMapVals: [],
		childTypeIndexMapVals: []
	}));
	parentTypeMap = childTypeMapVals.slice().map((typeMap) => typeMap.slice().reverse()).reverse();
	CHILD_TYPE_MAP = new Map(childTypeMapVals);
	CHILD_TYPE_INDEX_MAP = new Map(childTypeIndexMapVals);
	PARENT_TYPE_MAP = new Map(parentTypeMap.slice());
	columnTemplates = [
		[{
			value: "100.0",
			label: "100%"
		}],
		[
			{
				value: "50.0,50.0",
				label: "50 | 50"
			},
			{
				value: "33.3,66.6",
				label: "33 | 66"
			},
			{
				value: "66.6,33.3",
				label: "66 | 33"
			}
		],
		[
			{
				value: "33.3,33.3,33.3",
				label: "33 | 33 | 33"
			},
			{
				value: "25.0,25.0,50.0",
				label: "25 | 25 | 50"
			},
			{
				value: "50.0,25.0,25.0",
				label: "50 | 25 | 25"
			},
			{
				value: "25.0,50.0,25.0",
				label: "25 | 50 | 25"
			}
		],
		[{
			value: "25.0,25.0,25.0,25.0",
			label: "25 | 25 | 25 | 25"
		}],
		[{
			value: "20.0,20.0,20.0,20.0,20.0",
			label: "20 | 20 | 20 | 20 | 20"
		}],
		[{
			value: "16.66,16.66,16.66,16.66,16.66,16.66",
			label: "16.66 | 16.66 | 16.66 | 16.66 | 16.66 | 16.66"
		}]
	];
	COLUMN_TEMPLATES = new Map(columnTemplates.reduce((acc, cur, idx) => {
		acc.push([idx, cur]);
		return acc;
	}, []));
	SESSION_FORMDATA_KEY = `${name}-formData`;
	SESSION_LOCALE_KEY = `${name}-locale`;
	ANIMATION_SPEED_FAST = Math.round(333 / 2);
	ANIMATION_SPEED_SLOW = Math.round(333 * 2);
	EVENT_FORMEO_SAVED = "formeoSaved";
	EVENT_FORMEO_UPDATED = "formeoUpdated";
	EVENT_FORMEO_CHANGED = "formeoChanged";
	EVENT_FORMEO_UPDATED_STAGE = "formeoUpdatedStage";
	EVENT_FORMEO_UPDATED_ROW = "formeoUpdatedRow";
	EVENT_FORMEO_UPDATED_COLUMN = "formeoUpdatedColumn";
	EVENT_FORMEO_UPDATED_FIELD = "formeoUpdatedField";
	EVENT_FORMEO_CLEARED = "formeoCleared";
	EVENT_FORMEO_ON_RENDER = "formeoOnRender";
	EVENT_FORMEO_CONDITION_UPDATED = "formeoConditionUpdated";
	EVENT_FORMEO_ADDED_ROW = "formeoAddedRow";
	EVENT_FORMEO_ADDED_COLUMN = "formeoAddedColumn";
	EVENT_FORMEO_ADDED_FIELD = "formeoAddedField";
	EVENT_FORMEO_REMOVED_ROW = "formeoRemovedRow";
	EVENT_FORMEO_REMOVED_COLUMN = "formeoRemovedColumn";
	EVENT_FORMEO_REMOVED_FIELD = "formeoRemovedField";
	COMPARISON_OPERATORS = {
		equals: "==",
		notEquals: "!=",
		contains: "⊃",
		notContains: "!⊃"
	};
	LOGICAL_OPERATORS = {
		and: "&&",
		or: "||"
	};
	ASSIGNMENT_OPERATORS = { equals: "=" };
	CONDITION_INPUT_ORDER = [
		"logical",
		"source",
		"sourceProperty",
		"comparison",
		"target",
		"targetProperty",
		"assignment",
		"value"
	];
	CHECKABLE_OPTIONS = ["isChecked", "isNotChecked"];
	VISIBLE_OPTIONS = ["isVisible", "isNotVisible"];
	PROPERTY_OPTIONS = ["value"];
	OPERATORS = {
		comparison: COMPARISON_OPERATORS,
		assignment: ASSIGNMENT_OPERATORS,
		logical: LOGICAL_OPERATORS
	};
	conditionTypeThen = "then";
	CONDITION_TEMPLATE = () => ({
		["if"]: [{
			source: "",
			sourceProperty: "",
			comparison: "",
			target: "",
			targetProperty: ""
		}],
		[conditionTypeThen]: [{
			target: "",
			targetProperty: "",
			assignment: "",
			value: ""
		}]
	});
	UUID_REGEXP = /(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b)|(\b[0-9a-f]{8}\b)/g;
	bsColRegExp = /\bcol-\w+-\d+/g;
	iconPrefix = "f-i-";
	DEFAULT_FORMDATA = () => ({
		id: uuid(),
		stages: { [uuid()]: {} },
		rows: {},
		columns: {},
		fields: {}
	});
	CHECKED_TYPES = ["selected", "checked"];
	REVERSED_CHECKED_TYPES = CHECKED_TYPES.toReversed();
	FILTERED_PANEL_DATA_KEYS = new Map([["config", new Set([
		"label",
		"helpText",
		"hideLabel",
		"labelAfter",
		"disableHtmlLabel",
		"tooltip"
	])]]);
}));
//#endregion
//#region src/lib/js/common/utils/string.mjs
/**
* Converts a given string to title case.
*
* @param {string} str - The string to be converted.
* @returns {string} - The converted string in title case. If the input is not a string or contains spaces, it returns the original input.
*/
function toTitleCase(str) {
	if (typeof str !== "string") return str;
	if (str.trim().match(regexSpace)) return str;
	return str.replace(toTitleCaseRegex, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).replace(/[A-Z]/g, (word) => ` ${word}`));
}
function trimKeyPrefix(key) {
	return key.replaceAll(keyPrefixRegex, "");
}
var toTitleCaseLowers, toTitleCaseRegex, regexSpace, slugify, splitAddress, slugifyAddress, extractTextFromHtml, truncateByWord, keyPrefixRegex;
var init_string = __esmMin((() => {
	toTitleCaseLowers = "a an and as at but by for for from in into near nor of on onto or the to with".split(" ").map((lower) => String.raw`\s${lower}\s`);
	toTitleCaseRegex = new RegExp(String.raw`(?!${toTitleCaseLowers.join("|")})\w\S*`, "g");
	regexSpace = /\s+/g;
	slugify = (str, separator = "-") => str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, separator);
	splitAddress = (str) => {
		if (Array.isArray(str)) return str;
		const regex = /[.[\]]/g;
		const matches = [];
		let lastIndex = 0;
		let match = regex.exec(str);
		while (match !== null) {
			matches.push(str.slice(lastIndex, match.index));
			lastIndex = match.index + match[0].length;
			match = regex.exec(str);
		}
		if (lastIndex < str.length) matches.push(str.slice(lastIndex));
		return matches.filter(Boolean);
	};
	slugifyAddress = (str, separator = "-") => {
		return splitAddress(str).join(separator);
	};
	extractTextFromHtml = (htmlString) => {
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = htmlString;
		return tempDiv.textContent || tempDiv.innerText || "";
	};
	truncateByWord = (str, maxLength, tail = "…") => {
		if (str.length <= maxLength) return str;
		const truncated = str.slice(0, maxLength);
		const spaceIndex = truncated.lastIndexOf(" ");
		let truncatedWord = `${spaceIndex > 0 ? truncated.slice(0, spaceIndex) : truncated}`;
		if (tail) truncatedWord += tail;
		return truncatedWord;
	};
	keyPrefixRegex = /^attrs\.|^meta\.|^options\.|^config\./g;
}));
//#endregion
//#region node_modules/lodash/isSymbol.js
var require_isSymbol = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGetTag = require__baseGetTag(), isObjectLike = require_isObjectLike();
	/** `Object#toString` result references. */
	var symbolTag = "[object Symbol]";
	/**
	* Checks if `value` is classified as a `Symbol` primitive or object.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	* @example
	*
	* _.isSymbol(Symbol.iterator);
	* // => true
	*
	* _.isSymbol('abc');
	* // => false
	*/
	function isSymbol(value) {
		return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
	}
	module.exports = isSymbol;
}));
//#endregion
//#region node_modules/lodash/_isKey.js
var require__isKey = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isArray = require_isArray(), isSymbol = require_isSymbol();
	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
	/**
	* Checks if `value` is a property name and not a property path.
	*
	* @private
	* @param {*} value The value to check.
	* @param {Object} [object] The object to query keys on.
	* @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	*/
	function isKey(value, object) {
		if (isArray(value)) return false;
		var type = typeof value;
		if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) return true;
		return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
	}
	module.exports = isKey;
}));
//#endregion
//#region node_modules/lodash/memoize.js
var require_memoize = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var MapCache = require__MapCache();
	/** Error message constants. */
	var FUNC_ERROR_TEXT = "Expected a function";
	/**
	* Creates a function that memoizes the result of `func`. If `resolver` is
	* provided, it determines the cache key for storing the result based on the
	* arguments provided to the memoized function. By default, the first argument
	* provided to the memoized function is used as the map cache key. The `func`
	* is invoked with the `this` binding of the memoized function.
	*
	* **Note:** The cache is exposed as the `cache` property on the memoized
	* function. Its creation may be customized by replacing the `_.memoize.Cache`
	* constructor with one whose instances implement the
	* [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	* method interface of `clear`, `delete`, `get`, `has`, and `set`.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Function
	* @param {Function} func The function to have its output memoized.
	* @param {Function} [resolver] The function to resolve the cache key.
	* @returns {Function} Returns the new memoized function.
	* @example
	*
	* var object = { 'a': 1, 'b': 2 };
	* var other = { 'c': 3, 'd': 4 };
	*
	* var values = _.memoize(_.values);
	* values(object);
	* // => [1, 2]
	*
	* values(other);
	* // => [3, 4]
	*
	* object.a = 2;
	* values(object);
	* // => [1, 2]
	*
	* // Modify the result cache.
	* values.cache.set(object, ['a', 'b']);
	* values(object);
	* // => ['a', 'b']
	*
	* // Replace `_.memoize.Cache`.
	* _.memoize.Cache = WeakMap;
	*/
	function memoize(func, resolver) {
		if (typeof func != "function" || resolver != null && typeof resolver != "function") throw new TypeError(FUNC_ERROR_TEXT);
		var memoized = function() {
			var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
			if (cache.has(key)) return cache.get(key);
			var result = func.apply(this, args);
			memoized.cache = cache.set(key, result) || cache;
			return result;
		};
		memoized.cache = new (memoize.Cache || MapCache)();
		return memoized;
	}
	memoize.Cache = MapCache;
	module.exports = memoize;
}));
//#endregion
//#region node_modules/lodash/_memoizeCapped.js
var require__memoizeCapped = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var memoize = require_memoize();
	/** Used as the maximum memoize cache size. */
	var MAX_MEMOIZE_SIZE = 500;
	/**
	* A specialized version of `_.memoize` which clears the memoized function's
	* cache when it exceeds `MAX_MEMOIZE_SIZE`.
	*
	* @private
	* @param {Function} func The function to have its output memoized.
	* @returns {Function} Returns the new memoized function.
	*/
	function memoizeCapped(func) {
		var result = memoize(func, function(key) {
			if (cache.size === MAX_MEMOIZE_SIZE) cache.clear();
			return key;
		});
		var cache = result.cache;
		return result;
	}
	module.exports = memoizeCapped;
}));
//#endregion
//#region node_modules/lodash/_stringToPath.js
var require__stringToPath = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var memoizeCapped = require__memoizeCapped();
	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;
	module.exports = memoizeCapped(function(string) {
		var result = [];
		if (string.charCodeAt(0) === 46) result.push("");
		string.replace(rePropName, function(match, number, quote, subString) {
			result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
		});
		return result;
	});
}));
//#endregion
//#region node_modules/lodash/_arrayMap.js
var require__arrayMap = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* A specialized version of `_.map` for arrays without support for iteratee
	* shorthands.
	*
	* @private
	* @param {Array} [array] The array to iterate over.
	* @param {Function} iteratee The function invoked per iteration.
	* @returns {Array} Returns the new mapped array.
	*/
	function arrayMap(array, iteratee) {
		var index = -1, length = array == null ? 0 : array.length, result = Array(length);
		while (++index < length) result[index] = iteratee(array[index], index, array);
		return result;
	}
	module.exports = arrayMap;
}));
//#endregion
//#region node_modules/lodash/_baseToString.js
var require__baseToString = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Symbol = require__Symbol(), arrayMap = require__arrayMap(), isArray = require_isArray(), isSymbol = require_isSymbol();
	/** Used as references for various `Number` constants. */
	var INFINITY = Infinity;
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
	/**
	* The base implementation of `_.toString` which doesn't convert nullish
	* values to empty strings.
	*
	* @private
	* @param {*} value The value to process.
	* @returns {string} Returns the string.
	*/
	function baseToString(value) {
		if (typeof value == "string") return value;
		if (isArray(value)) return arrayMap(value, baseToString) + "";
		if (isSymbol(value)) return symbolToString ? symbolToString.call(value) : "";
		var result = value + "";
		return result == "0" && 1 / value == -INFINITY ? "-0" : result;
	}
	module.exports = baseToString;
}));
//#endregion
//#region node_modules/lodash/toString.js
var require_toString = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseToString = require__baseToString();
	/**
	* Converts `value` to a string. An empty string is returned for `null`
	* and `undefined` values. The sign of `-0` is preserved.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to convert.
	* @returns {string} Returns the converted string.
	* @example
	*
	* _.toString(null);
	* // => ''
	*
	* _.toString(-0);
	* // => '-0'
	*
	* _.toString([1, 2, 3]);
	* // => '1,2,3'
	*/
	function toString(value) {
		return value == null ? "" : baseToString(value);
	}
	module.exports = toString;
}));
//#endregion
//#region node_modules/lodash/_castPath.js
var require__castPath = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isArray = require_isArray(), isKey = require__isKey(), stringToPath = require__stringToPath(), toString = require_toString();
	/**
	* Casts `value` to a path array if it's not one.
	*
	* @private
	* @param {*} value The value to inspect.
	* @param {Object} [object] The object to query keys on.
	* @returns {Array} Returns the cast property path array.
	*/
	function castPath(value, object) {
		if (isArray(value)) return value;
		return isKey(value, object) ? [value] : stringToPath(toString(value));
	}
	module.exports = castPath;
}));
//#endregion
//#region node_modules/lodash/_toKey.js
var require__toKey = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isSymbol = require_isSymbol();
	/** Used as references for various `Number` constants. */
	var INFINITY = Infinity;
	/**
	* Converts `value` to a string key if it's not a string or symbol.
	*
	* @private
	* @param {*} value The value to inspect.
	* @returns {string|symbol} Returns the key.
	*/
	function toKey(value) {
		if (typeof value == "string" || isSymbol(value)) return value;
		var result = value + "";
		return result == "0" && 1 / value == -INFINITY ? "-0" : result;
	}
	module.exports = toKey;
}));
//#endregion
//#region node_modules/lodash/_baseGet.js
var require__baseGet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var castPath = require__castPath(), toKey = require__toKey();
	/**
	* The base implementation of `_.get` without support for default values.
	*
	* @private
	* @param {Object} object The object to query.
	* @param {Array|string} path The path of the property to get.
	* @returns {*} Returns the resolved value.
	*/
	function baseGet(object, path) {
		path = castPath(path, object);
		var index = 0, length = path.length;
		while (object != null && index < length) object = object[toKey(path[index++])];
		return index && index == length ? object : void 0;
	}
	module.exports = baseGet;
}));
//#endregion
//#region node_modules/lodash/get.js
var require_get = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGet = require__baseGet();
	/**
	* Gets the value at `path` of `object`. If the resolved value is
	* `undefined`, the `defaultValue` is returned in its place.
	*
	* @static
	* @memberOf _
	* @since 3.7.0
	* @category Object
	* @param {Object} object The object to query.
	* @param {Array|string} path The path of the property to get.
	* @param {*} [defaultValue] The value returned for `undefined` resolved values.
	* @returns {*} Returns the resolved value.
	* @example
	*
	* var object = { 'a': [{ 'b': { 'c': 3 } }] };
	*
	* _.get(object, 'a[0].b.c');
	* // => 3
	*
	* _.get(object, ['a', '0', 'b', 'c']);
	* // => 3
	*
	* _.get(object, 'a.b.c', 'default');
	* // => 'default'
	*/
	function get(object, path, defaultValue) {
		var result = object == null ? void 0 : baseGet(object, path);
		return result === void 0 ? defaultValue : result;
	}
	module.exports = get;
}));
//#endregion
//#region node_modules/lodash/_baseSet.js
var require__baseSet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var assignValue = require__assignValue(), castPath = require__castPath(), isIndex = require__isIndex(), isObject = require_isObject(), toKey = require__toKey();
	/**
	* The base implementation of `_.set`.
	*
	* @private
	* @param {Object} object The object to modify.
	* @param {Array|string} path The path of the property to set.
	* @param {*} value The value to set.
	* @param {Function} [customizer] The function to customize path creation.
	* @returns {Object} Returns `object`.
	*/
	function baseSet(object, path, value, customizer) {
		if (!isObject(object)) return object;
		path = castPath(path, object);
		var index = -1, length = path.length, lastIndex = length - 1, nested = object;
		while (nested != null && ++index < length) {
			var key = toKey(path[index]), newValue = value;
			if (key === "__proto__" || key === "constructor" || key === "prototype") return object;
			if (index != lastIndex) {
				var objValue = nested[key];
				newValue = customizer ? customizer(objValue, key, nested) : void 0;
				if (newValue === void 0) newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
			}
			assignValue(nested, key, newValue);
			nested = nested[key];
		}
		return object;
	}
	module.exports = baseSet;
}));
//#endregion
//#region node_modules/lodash/set.js
var require_set = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseSet = require__baseSet();
	/**
	* Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
	* it's created. Arrays are created for missing index properties while objects
	* are created for all other missing properties. Use `_.setWith` to customize
	* `path` creation.
	*
	* **Note:** This method mutates `object`.
	*
	* @static
	* @memberOf _
	* @since 3.7.0
	* @category Object
	* @param {Object} object The object to modify.
	* @param {Array|string} path The path of the property to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns `object`.
	* @example
	*
	* var object = { 'a': [{ 'b': { 'c': 3 } }] };
	*
	* _.set(object, 'a[0].b.c', 4);
	* console.log(object.a[0].b.c);
	* // => 4
	*
	* _.set(object, ['x', '0', 'y', 'z'], 5);
	* console.log(object.x[0].y.z);
	* // => 5
	*/
	function set(object, path, value) {
		return object == null ? object : baseSet(object, path, value);
	}
	module.exports = set;
}));
//#endregion
//#region src/lib/js/common/utils/object.mjs
/**
* Merges two action objects. If a key already exists in the target object,
* converts the value to an array and adds the value of the source object's key to the array.
*
* @param {Object} target - The target object to merge into.
* @param {Object} source - The source object to merge from.
* @returns {Object} - The merged object.
*/
function mergeActions(target, source = {}) {
	const result = { ...target };
	for (const key in source) if (Object.hasOwn(source, key)) if (Object.hasOwn(result, key)) if (Array.isArray(result[key])) result[key].push(source[key]);
	else result[key] = [result[key], source[key]];
	else result[key] = source[key];
	return result;
}
/**
* Converts an array of strings into an object where each string becomes both a key and its value
* @param {string[]} arr - The input array of strings
* @returns {Object.<string, string>} An object where each array item is both a key and value
* @example
* objectFromStringArray(['foo', 'bar']) // returns { foo: 'foo', bar: 'bar' }
*/
function objectFromStringArray(...arr) {
	return arr.flat().reduce((acc, item) => {
		acc[item] = item;
		return acc;
	}, {});
}
var import_get, import_set, get, set;
var init_object = __esmMin((() => {
	import_get = /* @__PURE__ */ __toESM(require_get(), 1);
	import_set = /* @__PURE__ */ __toESM(require_set(), 1);
	get = import_get.default;
	set = import_set.default;
}));
//#endregion
//#region node_modules/lodash/_setCacheAdd.js
var require__setCacheAdd = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = "__lodash_hash_undefined__";
	/**
	* Adds `value` to the array cache.
	*
	* @private
	* @name add
	* @memberOf SetCache
	* @alias push
	* @param {*} value The value to cache.
	* @returns {Object} Returns the cache instance.
	*/
	function setCacheAdd(value) {
		this.__data__.set(value, HASH_UNDEFINED);
		return this;
	}
	module.exports = setCacheAdd;
}));
//#endregion
//#region node_modules/lodash/_setCacheHas.js
var require__setCacheHas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if `value` is in the array cache.
	*
	* @private
	* @name has
	* @memberOf SetCache
	* @param {*} value The value to search for.
	* @returns {boolean} Returns `true` if `value` is found, else `false`.
	*/
	function setCacheHas(value) {
		return this.__data__.has(value);
	}
	module.exports = setCacheHas;
}));
//#endregion
//#region node_modules/lodash/_SetCache.js
var require__SetCache = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var MapCache = require__MapCache(), setCacheAdd = require__setCacheAdd(), setCacheHas = require__setCacheHas();
	/**
	*
	* Creates an array cache object to store unique values.
	*
	* @private
	* @constructor
	* @param {Array} [values] The values to cache.
	*/
	function SetCache(values) {
		var index = -1, length = values == null ? 0 : values.length;
		this.__data__ = new MapCache();
		while (++index < length) this.add(values[index]);
	}
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;
	module.exports = SetCache;
}));
//#endregion
//#region node_modules/lodash/_arraySome.js
var require__arraySome = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* A specialized version of `_.some` for arrays without support for iteratee
	* shorthands.
	*
	* @private
	* @param {Array} [array] The array to iterate over.
	* @param {Function} predicate The function invoked per iteration.
	* @returns {boolean} Returns `true` if any element passes the predicate check,
	*  else `false`.
	*/
	function arraySome(array, predicate) {
		var index = -1, length = array == null ? 0 : array.length;
		while (++index < length) if (predicate(array[index], index, array)) return true;
		return false;
	}
	module.exports = arraySome;
}));
//#endregion
//#region node_modules/lodash/_cacheHas.js
var require__cacheHas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Checks if a `cache` value for `key` exists.
	*
	* @private
	* @param {Object} cache The cache to query.
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function cacheHas(cache, key) {
		return cache.has(key);
	}
	module.exports = cacheHas;
}));
//#endregion
//#region node_modules/lodash/_equalArrays.js
var require__equalArrays = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SetCache = require__SetCache(), arraySome = require__arraySome(), cacheHas = require__cacheHas();
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
	/**
	* A specialized version of `baseIsEqualDeep` for arrays with support for
	* partial deep comparisons.
	*
	* @private
	* @param {Array} array The array to compare.
	* @param {Array} other The other array to compare.
	* @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	* @param {Function} customizer The function to customize comparisons.
	* @param {Function} equalFunc The function to determine equivalents of values.
	* @param {Object} stack Tracks traversed `array` and `other` objects.
	* @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	*/
	function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
		var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
		if (arrLength != othLength && !(isPartial && othLength > arrLength)) return false;
		var arrStacked = stack.get(array);
		var othStacked = stack.get(other);
		if (arrStacked && othStacked) return arrStacked == other && othStacked == array;
		var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0;
		stack.set(array, other);
		stack.set(other, array);
		while (++index < arrLength) {
			var arrValue = array[index], othValue = other[index];
			if (customizer) var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
			if (compared !== void 0) {
				if (compared) continue;
				result = false;
				break;
			}
			if (seen) {
				if (!arraySome(other, function(othValue, othIndex) {
					if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) return seen.push(othIndex);
				})) {
					result = false;
					break;
				}
			} else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
				result = false;
				break;
			}
		}
		stack["delete"](array);
		stack["delete"](other);
		return result;
	}
	module.exports = equalArrays;
}));
//#endregion
//#region node_modules/lodash/_mapToArray.js
var require__mapToArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Converts `map` to its key-value pairs.
	*
	* @private
	* @param {Object} map The map to convert.
	* @returns {Array} Returns the key-value pairs.
	*/
	function mapToArray(map) {
		var index = -1, result = Array(map.size);
		map.forEach(function(value, key) {
			result[++index] = [key, value];
		});
		return result;
	}
	module.exports = mapToArray;
}));
//#endregion
//#region node_modules/lodash/_setToArray.js
var require__setToArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Converts `set` to an array of its values.
	*
	* @private
	* @param {Object} set The set to convert.
	* @returns {Array} Returns the values.
	*/
	function setToArray(set) {
		var index = -1, result = Array(set.size);
		set.forEach(function(value) {
			result[++index] = value;
		});
		return result;
	}
	module.exports = setToArray;
}));
//#endregion
//#region node_modules/lodash/_equalByTag.js
var require__equalByTag = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Symbol = require__Symbol(), Uint8Array = require__Uint8Array(), eq = require_eq(), equalArrays = require__equalArrays(), mapToArray = require__mapToArray(), setToArray = require__setToArray();
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
	/** `Object#toString` result references. */
	var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
	var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]";
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
	/**
	* A specialized version of `baseIsEqualDeep` for comparing objects of
	* the same `toStringTag`.
	*
	* **Note:** This function only supports comparing values with tags of
	* `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	*
	* @private
	* @param {Object} object The object to compare.
	* @param {Object} other The other object to compare.
	* @param {string} tag The `toStringTag` of the objects to compare.
	* @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	* @param {Function} customizer The function to customize comparisons.
	* @param {Function} equalFunc The function to determine equivalents of values.
	* @param {Object} stack Tracks traversed `object` and `other` objects.
	* @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	*/
	function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
		switch (tag) {
			case dataViewTag:
				if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) return false;
				object = object.buffer;
				other = other.buffer;
			case arrayBufferTag:
				if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) return false;
				return true;
			case boolTag:
			case dateTag:
			case numberTag: return eq(+object, +other);
			case errorTag: return object.name == other.name && object.message == other.message;
			case regexpTag:
			case stringTag: return object == other + "";
			case mapTag: var convert = mapToArray;
			case setTag:
				var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
				convert || (convert = setToArray);
				if (object.size != other.size && !isPartial) return false;
				var stacked = stack.get(object);
				if (stacked) return stacked == other;
				bitmask |= COMPARE_UNORDERED_FLAG;
				stack.set(object, other);
				var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
				stack["delete"](object);
				return result;
			case symbolTag: if (symbolValueOf) return symbolValueOf.call(object) == symbolValueOf.call(other);
		}
		return false;
	}
	module.exports = equalByTag;
}));
//#endregion
//#region node_modules/lodash/_arrayPush.js
var require__arrayPush = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Appends the elements of `values` to `array`.
	*
	* @private
	* @param {Array} array The array to modify.
	* @param {Array} values The values to append.
	* @returns {Array} Returns `array`.
	*/
	function arrayPush(array, values) {
		var index = -1, length = values.length, offset = array.length;
		while (++index < length) array[offset + index] = values[index];
		return array;
	}
	module.exports = arrayPush;
}));
//#endregion
//#region node_modules/lodash/_baseGetAllKeys.js
var require__baseGetAllKeys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arrayPush = require__arrayPush(), isArray = require_isArray();
	/**
	* The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	* `keysFunc` and `symbolsFunc` to get the enumerable property names and
	* symbols of `object`.
	*
	* @private
	* @param {Object} object The object to query.
	* @param {Function} keysFunc The function to get the keys of `object`.
	* @param {Function} symbolsFunc The function to get the symbols of `object`.
	* @returns {Array} Returns the array of property names and symbols.
	*/
	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
		var result = keysFunc(object);
		return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
	}
	module.exports = baseGetAllKeys;
}));
//#endregion
//#region node_modules/lodash/_arrayFilter.js
var require__arrayFilter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* A specialized version of `_.filter` for arrays without support for
	* iteratee shorthands.
	*
	* @private
	* @param {Array} [array] The array to iterate over.
	* @param {Function} predicate The function invoked per iteration.
	* @returns {Array} Returns the new filtered array.
	*/
	function arrayFilter(array, predicate) {
		var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
		while (++index < length) {
			var value = array[index];
			if (predicate(value, index, array)) result[resIndex++] = value;
		}
		return result;
	}
	module.exports = arrayFilter;
}));
//#endregion
//#region node_modules/lodash/stubArray.js
var require_stubArray = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This method returns a new empty array.
	*
	* @static
	* @memberOf _
	* @since 4.13.0
	* @category Util
	* @returns {Array} Returns the new empty array.
	* @example
	*
	* var arrays = _.times(2, _.stubArray);
	*
	* console.log(arrays);
	* // => [[], []]
	*
	* console.log(arrays[0] === arrays[1]);
	* // => false
	*/
	function stubArray() {
		return [];
	}
	module.exports = stubArray;
}));
//#endregion
//#region node_modules/lodash/_getSymbols.js
var require__getSymbols = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arrayFilter = require__arrayFilter(), stubArray = require_stubArray();
	/** Built-in value references. */
	var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
	var nativeGetSymbols = Object.getOwnPropertySymbols;
	module.exports = !nativeGetSymbols ? stubArray : function(object) {
		if (object == null) return [];
		object = Object(object);
		return arrayFilter(nativeGetSymbols(object), function(symbol) {
			return propertyIsEnumerable.call(object, symbol);
		});
	};
}));
//#endregion
//#region node_modules/lodash/_nativeKeys.js
var require__nativeKeys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__overArg()(Object.keys, Object);
}));
//#endregion
//#region node_modules/lodash/_baseKeys.js
var require__baseKeys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isPrototype = require__isPrototype(), nativeKeys = require__nativeKeys();
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	*
	* @private
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names.
	*/
	function baseKeys(object) {
		if (!isPrototype(object)) return nativeKeys(object);
		var result = [];
		for (var key in Object(object)) if (hasOwnProperty.call(object, key) && key != "constructor") result.push(key);
		return result;
	}
	module.exports = baseKeys;
}));
//#endregion
//#region node_modules/lodash/keys.js
var require_keys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var arrayLikeKeys = require__arrayLikeKeys(), baseKeys = require__baseKeys(), isArrayLike = require_isArrayLike();
	/**
	* Creates an array of the own enumerable property names of `object`.
	*
	* **Note:** Non-object values are coerced to objects. See the
	* [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	* for more details.
	*
	* @static
	* @since 0.1.0
	* @memberOf _
	* @category Object
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names.
	* @example
	*
	* function Foo() {
	*   this.a = 1;
	*   this.b = 2;
	* }
	*
	* Foo.prototype.c = 3;
	*
	* _.keys(new Foo);
	* // => ['a', 'b'] (iteration order is not guaranteed)
	*
	* _.keys('hi');
	* // => ['0', '1']
	*/
	function keys(object) {
		return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}
	module.exports = keys;
}));
//#endregion
//#region node_modules/lodash/_getAllKeys.js
var require__getAllKeys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseGetAllKeys = require__baseGetAllKeys(), getSymbols = require__getSymbols(), keys = require_keys();
	/**
	* Creates an array of own enumerable property names and symbols of `object`.
	*
	* @private
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names and symbols.
	*/
	function getAllKeys(object) {
		return baseGetAllKeys(object, keys, getSymbols);
	}
	module.exports = getAllKeys;
}));
//#endregion
//#region node_modules/lodash/_equalObjects.js
var require__equalObjects = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getAllKeys = require__getAllKeys();
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* A specialized version of `baseIsEqualDeep` for objects with support for
	* partial deep comparisons.
	*
	* @private
	* @param {Object} object The object to compare.
	* @param {Object} other The other object to compare.
	* @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	* @param {Function} customizer The function to customize comparisons.
	* @param {Function} equalFunc The function to determine equivalents of values.
	* @param {Object} stack Tracks traversed `object` and `other` objects.
	* @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	*/
	function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
		var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length;
		if (objLength != getAllKeys(other).length && !isPartial) return false;
		var index = objLength;
		while (index--) {
			var key = objProps[index];
			if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) return false;
		}
		var objStacked = stack.get(object);
		var othStacked = stack.get(other);
		if (objStacked && othStacked) return objStacked == other && othStacked == object;
		var result = true;
		stack.set(object, other);
		stack.set(other, object);
		var skipCtor = isPartial;
		while (++index < objLength) {
			key = objProps[index];
			var objValue = object[key], othValue = other[key];
			if (customizer) var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
			if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
				result = false;
				break;
			}
			skipCtor || (skipCtor = key == "constructor");
		}
		if (result && !skipCtor) {
			var objCtor = object.constructor, othCtor = other.constructor;
			if (objCtor != othCtor && "constructor" in object && "constructor" in other && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) result = false;
		}
		stack["delete"](object);
		stack["delete"](other);
		return result;
	}
	module.exports = equalObjects;
}));
//#endregion
//#region node_modules/lodash/_DataView.js
var require__DataView = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__getNative()(require__root(), "DataView");
}));
//#endregion
//#region node_modules/lodash/_Promise.js
var require__Promise = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__getNative()(require__root(), "Promise");
}));
//#endregion
//#region node_modules/lodash/_Set.js
var require__Set = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__getNative()(require__root(), "Set");
}));
//#endregion
//#region node_modules/lodash/_WeakMap.js
var require__WeakMap = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require__getNative()(require__root(), "WeakMap");
}));
//#endregion
//#region node_modules/lodash/_getTag.js
var require__getTag = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var DataView = require__DataView(), Map = require__Map(), Promise = require__Promise(), Set = require__Set(), WeakMap = require__WeakMap(), baseGetTag = require__baseGetTag(), toSource = require__toSource();
	/** `Object#toString` result references. */
	var mapTag = "[object Map]", objectTag = "[object Object]", promiseTag = "[object Promise]", setTag = "[object Set]", weakMapTag = "[object WeakMap]";
	var dataViewTag = "[object DataView]";
	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map), promiseCtorString = toSource(Promise), setCtorString = toSource(Set), weakMapCtorString = toSource(WeakMap);
	/**
	* Gets the `toStringTag` of `value`.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the `toStringTag`.
	*/
	var getTag = baseGetTag;
	if (DataView && getTag(new DataView(/* @__PURE__ */ new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) getTag = function(value) {
		var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
		if (ctorString) switch (ctorString) {
			case dataViewCtorString: return dataViewTag;
			case mapCtorString: return mapTag;
			case promiseCtorString: return promiseTag;
			case setCtorString: return setTag;
			case weakMapCtorString: return weakMapTag;
		}
		return result;
	};
	module.exports = getTag;
}));
//#endregion
//#region node_modules/lodash/_baseIsEqualDeep.js
var require__baseIsEqualDeep = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Stack = require__Stack(), equalArrays = require__equalArrays(), equalByTag = require__equalByTag(), equalObjects = require__equalObjects(), getTag = require__getTag(), isArray = require_isArray(), isBuffer = require_isBuffer(), isTypedArray = require_isTypedArray();
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;
	/** `Object#toString` result references. */
	var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* A specialized version of `baseIsEqual` for arrays and objects which performs
	* deep comparisons and tracks traversed objects enabling objects with circular
	* references to be compared.
	*
	* @private
	* @param {Object} object The object to compare.
	* @param {Object} other The other object to compare.
	* @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	* @param {Function} customizer The function to customize comparisons.
	* @param {Function} equalFunc The function to determine equivalents of values.
	* @param {Object} [stack] Tracks traversed `object` and `other` objects.
	* @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	*/
	function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
		var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
		objTag = objTag == argsTag ? objectTag : objTag;
		othTag = othTag == argsTag ? objectTag : othTag;
		var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
		if (isSameTag && isBuffer(object)) {
			if (!isBuffer(other)) return false;
			objIsArr = true;
			objIsObj = false;
		}
		if (isSameTag && !objIsObj) {
			stack || (stack = new Stack());
			return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
		}
		if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
			var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
			if (objIsWrapped || othIsWrapped) {
				var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
				stack || (stack = new Stack());
				return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
			}
		}
		if (!isSameTag) return false;
		stack || (stack = new Stack());
		return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}
	module.exports = baseIsEqualDeep;
}));
//#endregion
//#region node_modules/lodash/_baseIsEqual.js
var require__baseIsEqual = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseIsEqualDeep = require__baseIsEqualDeep(), isObjectLike = require_isObjectLike();
	/**
	* The base implementation of `_.isEqual` which supports partial comparisons
	* and tracks traversed objects.
	*
	* @private
	* @param {*} value The value to compare.
	* @param {*} other The other value to compare.
	* @param {boolean} bitmask The bitmask flags.
	*  1 - Unordered comparison
	*  2 - Partial comparison
	* @param {Function} [customizer] The function to customize comparisons.
	* @param {Object} [stack] Tracks traversed `value` and `other` objects.
	* @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	*/
	function baseIsEqual(value, other, bitmask, customizer, stack) {
		if (value === other) return true;
		if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) return value !== value && other !== other;
		return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	}
	module.exports = baseIsEqual;
}));
//#endregion
//#region node_modules/lodash/isEqual.js
var require_isEqual = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var baseIsEqual = require__baseIsEqual();
	/**
	* Performs a deep comparison between two values to determine if they are
	* equivalent.
	*
	* **Note:** This method supports comparing arrays, array buffers, booleans,
	* date objects, error objects, maps, numbers, `Object` objects, regexes,
	* sets, strings, symbols, and typed arrays. `Object` objects are compared
	* by their own, not inherited, enumerable properties. Functions and DOM
	* nodes are compared by strict equality, i.e. `===`.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Lang
	* @param {*} value The value to compare.
	* @param {*} other The other value to compare.
	* @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	* @example
	*
	* var object = { 'a': 1 };
	* var other = { 'a': 1 };
	*
	* _.isEqual(object, other);
	* // => true
	*
	* object === other;
	* // => false
	*/
	function isEqual(value, other) {
		return baseIsEqual(value, other);
	}
	module.exports = isEqual;
}));
//#endregion
//#region src/lib/js/components/data.js
var import_isEqual$1, getChangeType, Data;
var init_data = __esmMin((() => {
	import_isEqual$1 = /* @__PURE__ */ __toESM(require_isEqual(), 1);
	init_events();
	init_utils();
	init_object();
	init_string();
	init_constants();
	getChangeType = (oldVal, newVal) => {
		if (oldVal === void 0) return "added";
		if (newVal === void 0) return "removed";
		if ((0, import_isEqual$1.default)(oldVal, newVal)) return "unchanged";
		return "changed";
	};
	Data = class {
		constructor(name, data = Object.create(null)) {
			this.name = name;
			this.data = data;
			this.dataPath = "";
		}
		get size() {
			return Object.keys(this.data).length;
		}
		get js() {
			return this.data;
		}
		get json() {
			return this.data;
		}
		toJSON = (data, format) => JSON.stringify(data, null, format);
		get = (path) => get(this.data, path);
		set(path, newVal) {
			const oldVal = get(this.data, path);
			const data = set(this.data, path, newVal);
			const callbackPath = Array.isArray(path) ? path.join(".") : path;
			const callBackGroups = Object.keys(this.setCallbacks).filter((setKey) => new RegExp(setKey).test(callbackPath));
			const cbArgs = {
				newVal,
				oldVal,
				path
			};
			for (const cbGroup of callBackGroups) for (const cb of this.setCallbacks[cbGroup]) cb(cbArgs);
			if (!this.disableEvents) {
				const evtData = {
					entity: this,
					dataPath: this.dataPath.replace(/\.+$/, ""),
					changePath: this.dataPath + path,
					value: newVal,
					data,
					changeType: getChangeType(oldVal, newVal),
					src: this.dom
				};
				if (oldVal) evtData.previousValue = oldVal;
				events.formeoUpdated(evtData);
				if (this.name) {
					const specificEvent = {
						stage: EVENT_FORMEO_UPDATED_STAGE,
						row: EVENT_FORMEO_UPDATED_ROW,
						column: EVENT_FORMEO_UPDATED_COLUMN,
						field: EVENT_FORMEO_UPDATED_FIELD
					}[this.name];
					if (specificEvent) events.formeoUpdated(evtData, specificEvent);
				}
			}
			return data;
		}
		addSetCallback(path, cb) {
			if (this.setCallbacks[path]) this.setCallbacks[path].push(cb);
			else this.setCallbacks[path] = [cb];
		}
		removeSetCallback(path, cb) {
			this.setCallbacks[path] = this.setCallbacks[path].filter((setCb) => setCb !== cb);
		}
		add = (id, data = Object.create(null)) => {
			const { id: dataId } = data;
			const elemId = id || dataId || uuid();
			return this.set(elemId, data);
		};
		remove = (path) => {
			const delPath = splitAddress(path);
			const delItem = delPath.pop();
			const parent = this.get(delPath);
			if (Array.isArray(parent)) parent.splice(Number(delItem), 1);
			else if (parent) delete parent[delItem];
			return parent;
		};
		empty() {
			this.data = Object.create(null);
		}
		getData = () => {
			return Object.entries(this.data).reduce((acc, [key, val]) => {
				acc[key] = val?.data ? val.getData() : val;
				return acc;
			}, {});
		};
		setCallbacks = {};
		configVal = Object.create(null);
	};
}));
//#endregion
//#region src/lib/js/components/component-data.js
var ComponentData;
var init_component_data = __esmMin((() => {
	init_events();
	init_utils();
	init_object();
	init_constants();
	init_data();
	ComponentData = class extends Data {
		load = (dataArg) => {
			const data = parseData(dataArg);
			this.empty();
			for (const [key, val] of Object.entries(data)) this.add(key, val);
			return this.data;
		};
		/**
		* Retrieves data from the specified path or adds new data if no path is provided.
		*
		* @param {string} [path] - The path to retrieve data from. If not provided, new data will be added.
		* @returns {*} The data retrieved from the specified path or the result of adding new data.
		*/
		get = (path) => path ? get(this.data, path) : this.add();
		/**
		* Adds a new component with the given id and data.
		*
		* @param {string} id - The unique identifier for the component. If not provided, a new UUID will be generated.
		* @param {Object} [data=Object.create(null)] - The data to initialize the component with.
		* @returns {Object} The newly created component.
		*/
		add = (id, data = Object.create(null)) => {
			const elemId = id || uuid();
			const component = this.Component({
				...data,
				id: elemId
			});
			this.data[elemId] = component;
			this.active = component;
			const addEvent = {
				row: EVENT_FORMEO_ADDED_ROW,
				column: EVENT_FORMEO_ADDED_COLUMN,
				field: EVENT_FORMEO_ADDED_FIELD
			}[this.name];
			if (addEvent) events.formeoUpdated({
				entity: component,
				componentId: elemId,
				componentType: this.name,
				data: component.data
			}, addEvent);
			return component;
		};
		/**
		* removes a component form the index
		* @param {String|Array} componentId
		*/
		remove = (componentId) => {
			if (Array.isArray(componentId)) for (const id of componentId) this.get(id).remove();
			else this.get(componentId).remove();
			return this.data;
		};
		/**
		* Deletes a component from the data object.
		*
		* @param {string} componentId - The ID of the component to delete.
		* @returns {string} The ID of the deleted component.
		*/
		delete = (componentId) => {
			delete this.data[componentId];
			return componentId;
		};
		/**
		* Clears all instances from the store
		* @param {Object} evt
		*/
		clearAll = (isAnimated = true) => {
			const promises = Object.values(this.data).map((component) => component.empty(isAnimated));
			return Promise.all(promises);
		};
		/**
		* Extends the configVal for a component type,
		* eventually read by Component
		* @return {Object} configVal
		*/
		set config(config) {
			this.configVal = merge(this.configVal, clone$1(config));
		}
		/**
		* Reads configVal for a component type
		* @return {Object} configVal
		*/
		get config() {
			return this.configVal;
		}
		conditionMap = /* @__PURE__ */ new Map();
	};
}));
//#endregion
//#region node_modules/sortablejs/modular/sortable.esm.js
/**!
* Sortable 1.15.7
* @author	RubaXa   <trash@rubaxa.org>
* @author	owenm    <owen23355@gmail.com>
* @license MIT
*/
function _defineProperty(e, r, t) {
	return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[r] = t, e;
}
function _extends() {
	return _extends = Object.assign ? Object.assign.bind() : function(n) {
		for (var e = 1; e < arguments.length; e++) {
			var t = arguments[e];
			for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
		}
		return n;
	}, _extends.apply(null, arguments);
}
function ownKeys(e, r) {
	var t = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var o = Object.getOwnPropertySymbols(e);
		r && (o = o.filter(function(r) {
			return Object.getOwnPropertyDescriptor(e, r).enumerable;
		})), t.push.apply(t, o);
	}
	return t;
}
function _objectSpread2(e) {
	for (var r = 1; r < arguments.length; r++) {
		var t = null != arguments[r] ? arguments[r] : {};
		r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
			_defineProperty(e, r, t[r]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
			Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
		});
	}
	return e;
}
function _objectWithoutProperties(e, t) {
	if (null == e) return {};
	var o, r, i = _objectWithoutPropertiesLoose(e, t);
	if (Object.getOwnPropertySymbols) {
		var n = Object.getOwnPropertySymbols(e);
		for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
	}
	return i;
}
function _objectWithoutPropertiesLoose(r, e) {
	if (null == r) return {};
	var t = {};
	for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
		if (-1 !== e.indexOf(n)) continue;
		t[n] = r[n];
	}
	return t;
}
function _toPrimitive(t, r) {
	if ("object" != typeof t || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != typeof i) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
	var i = _toPrimitive(t, "string");
	return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof(o);
}
function userAgent(pattern) {
	if (typeof window !== "undefined" && window.navigator) return !!/* @__PURE__ */ navigator.userAgent.match(pattern);
}
function on(el, event, fn) {
	el.addEventListener(event, fn, !IE11OrLess && captureMode);
}
function off(el, event, fn) {
	el.removeEventListener(event, fn, !IE11OrLess && captureMode);
}
function matches(el, selector) {
	if (!selector) return;
	selector[0] === ">" && (selector = selector.substring(1));
	if (el) try {
		if (el.matches) return el.matches(selector);
		else if (el.msMatchesSelector) return el.msMatchesSelector(selector);
		else if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
	} catch (_) {
		return false;
	}
	return false;
}
function getParentOrHost(el) {
	return el.host && el !== document && el.host.nodeType && el.host !== el ? el.host : el.parentNode;
}
function closest(el, selector, ctx, includeCTX) {
	if (el) {
		ctx = ctx || document;
		do {
			if (selector != null && (selector[0] === ">" ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) return el;
			if (el === ctx) break;
		} while (el = getParentOrHost(el));
	}
	return null;
}
function toggleClass(el, name, state) {
	if (el && name) if (el.classList) el.classList[state ? "add" : "remove"](name);
	else el.className = ((" " + el.className + " ").replace(R_SPACE, " ").replace(" " + name + " ", " ") + (state ? " " + name : "")).replace(R_SPACE, " ");
}
function css(el, prop, val) {
	var style = el && el.style;
	if (style) if (val === void 0) {
		if (document.defaultView && document.defaultView.getComputedStyle) val = document.defaultView.getComputedStyle(el, "");
		else if (el.currentStyle) val = el.currentStyle;
		return prop === void 0 ? val : val[prop];
	} else {
		if (!(prop in style) && prop.indexOf("webkit") === -1) prop = "-webkit-" + prop;
		style[prop] = val + (typeof val === "string" ? "" : "px");
	}
}
function matrix(el, selfOnly) {
	var appliedTransforms = "";
	if (typeof el === "string") appliedTransforms = el;
	else do {
		var transform = css(el, "transform");
		if (transform && transform !== "none") appliedTransforms = transform + " " + appliedTransforms;
	} while (!selfOnly && (el = el.parentNode));
	var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
	return matrixFn && new matrixFn(appliedTransforms);
}
function find(ctx, tagName, iterator) {
	if (ctx) {
		var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;
		if (iterator) for (; i < n; i++) iterator(list[i], i);
		return list;
	}
	return [];
}
function getWindowScrollingElement() {
	var scrollingElement = document.scrollingElement;
	if (scrollingElement) return scrollingElement;
	else return document.documentElement;
}
/**
* Returns the "bounding client rect" of given element
* @param  {HTMLElement} el                       The element whose boundingClientRect is wanted
* @param  {[Boolean]} relativeToContainingBlock  Whether the rect should be relative to the containing block of (including) the container
* @param  {[Boolean]} relativeToNonStaticParent  Whether the rect should be relative to the relative parent of (including) the contaienr
* @param  {[Boolean]} undoScale                  Whether the container's scale() should be undone
* @param  {[HTMLElement]} container              The parent the element will be placed in
* @return {Object}                               The boundingClientRect of el, with specified adjustments
*/
function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
	if (!el.getBoundingClientRect && el !== window) return;
	var elRect, top, left, bottom, right, height, width;
	if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
		elRect = el.getBoundingClientRect();
		top = elRect.top;
		left = elRect.left;
		bottom = elRect.bottom;
		right = elRect.right;
		height = elRect.height;
		width = elRect.width;
	} else {
		top = 0;
		left = 0;
		bottom = window.innerHeight;
		right = window.innerWidth;
		height = window.innerHeight;
		width = window.innerWidth;
	}
	if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
		container = container || el.parentNode;
		if (!IE11OrLess) do
			if (container && container.getBoundingClientRect && (css(container, "transform") !== "none" || relativeToNonStaticParent && css(container, "position") !== "static")) {
				var containerRect = container.getBoundingClientRect();
				top -= containerRect.top + parseInt(css(container, "border-top-width"));
				left -= containerRect.left + parseInt(css(container, "border-left-width"));
				bottom = top + elRect.height;
				right = left + elRect.width;
				break;
			}
		while (container = container.parentNode);
	}
	if (undoScale && el !== window) {
		var elMatrix = matrix(container || el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d;
		if (elMatrix) {
			top /= scaleY;
			left /= scaleX;
			width /= scaleX;
			height /= scaleY;
			bottom = top + height;
			right = left + width;
		}
	}
	return {
		top,
		left,
		bottom,
		right,
		width,
		height
	};
}
/**
* Checks if a side of an element is scrolled past a side of its parents
* @param  {HTMLElement}  el           The element who's side being scrolled out of view is in question
* @param  {String}       elSide       Side of the element in question ('top', 'left', 'right', 'bottom')
* @param  {String}       parentSide   Side of the parent in question ('top', 'left', 'right', 'bottom')
* @return {HTMLElement}               The parent scroll element that the el's side is scrolled past, or null if there is no such element
*/
function isScrolledPast(el, elSide, parentSide) {
	var parent = getParentAutoScrollElement(el, true), elSideVal = getRect(el)[elSide];
	while (parent) {
		var parentSideVal = getRect(parent)[parentSide], visible = void 0;
		if (parentSide === "top" || parentSide === "left") visible = elSideVal >= parentSideVal;
		else visible = elSideVal <= parentSideVal;
		if (!visible) return parent;
		if (parent === getWindowScrollingElement()) break;
		parent = getParentAutoScrollElement(parent, false);
	}
	return false;
}
/**
* Gets nth child of el, ignoring hidden children, sortable's elements (does not ignore clone if it's visible)
* and non-draggable elements
* @param  {HTMLElement} el       The parent element
* @param  {Number} childNum      The index of the child
* @param  {Object} options       Parent Sortable's options
* @return {HTMLElement}          The child at index childNum, or null if not found
*/
function getChild(el, childNum, options, includeDragEl) {
	var currentChild = 0, i = 0, children = el.children;
	while (i < children.length) {
		if (children[i].style.display !== "none" && children[i] !== Sortable.ghost && (includeDragEl || children[i] !== Sortable.dragged) && closest(children[i], options.draggable, el, false)) {
			if (currentChild === childNum) return children[i];
			currentChild++;
		}
		i++;
	}
	return null;
}
/**
* Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
* @param  {HTMLElement} el       Parent element
* @param  {selector} selector    Any other elements that should be ignored
* @return {HTMLElement}          The last child, ignoring ghostEl
*/
function lastChild(el, selector) {
	var last = el.lastElementChild;
	while (last && (last === Sortable.ghost || css(last, "display") === "none" || selector && !matches(last, selector))) last = last.previousElementSibling;
	return last || null;
}
/**
* Returns the index of an element within its parent for a selected set of
* elements
* @param  {HTMLElement} el
* @param  {selector} selector
* @return {number}
*/
function index(el, selector) {
	var index = 0;
	if (!el || !el.parentNode) return -1;
	while (el = el.previousElementSibling) if (el.nodeName.toUpperCase() !== "TEMPLATE" && el !== Sortable.clone && (!selector || matches(el, selector))) index++;
	return index;
}
/**
* Returns the scroll offset of the given element, added with all the scroll offsets of parent elements.
* The value is returned in real pixels.
* @param  {HTMLElement} el
* @return {Array}             Offsets in the format of [left, top]
*/
function getRelativeScrollOffset(el) {
	var offsetLeft = 0, offsetTop = 0, winScroller = getWindowScrollingElement();
	if (el) do {
		var elMatrix = matrix(el), scaleX = elMatrix.a, scaleY = elMatrix.d;
		offsetLeft += el.scrollLeft * scaleX;
		offsetTop += el.scrollTop * scaleY;
	} while (el !== winScroller && (el = el.parentNode));
	return [offsetLeft, offsetTop];
}
/**
* Returns the index of the object within the given array
* @param  {Array} arr   Array that may or may not hold the object
* @param  {Object} obj  An object that has a key-value pair unique to and identical to a key-value pair in the object you want to find
* @return {Number}      The index of the object in the array, or -1
*/
function indexOfObject(arr, obj) {
	for (var i in arr) {
		if (!arr.hasOwnProperty(i)) continue;
		for (var key in obj) if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) return Number(i);
	}
	return -1;
}
function getParentAutoScrollElement(el, includeSelf) {
	if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();
	var elem = el;
	var gotSelf = false;
	do
		if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
			var elemCSS = css(elem);
			if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == "auto" || elemCSS.overflowX == "scroll") || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == "auto" || elemCSS.overflowY == "scroll")) {
				if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
				if (gotSelf || includeSelf) return elem;
				gotSelf = true;
			}
		}
	while (elem = elem.parentNode);
	return getWindowScrollingElement();
}
function extend(dst, src) {
	if (dst && src) {
		for (var key in src) if (src.hasOwnProperty(key)) dst[key] = src[key];
	}
	return dst;
}
function isRectEqual(rect1, rect2) {
	return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
}
function throttle(callback, ms) {
	return function() {
		if (!_throttleTimeout) {
			var args = arguments, _this = this;
			if (args.length === 1) callback.call(_this, args[0]);
			else callback.apply(_this, args);
			_throttleTimeout = setTimeout(function() {
				_throttleTimeout = void 0;
			}, ms);
		}
	};
}
function cancelThrottle() {
	clearTimeout(_throttleTimeout);
	_throttleTimeout = void 0;
}
function scrollBy(el, x, y) {
	el.scrollLeft += x;
	el.scrollTop += y;
}
function clone(el) {
	var Polymer = window.Polymer;
	var $ = window.jQuery || window.Zepto;
	if (Polymer && Polymer.dom) return Polymer.dom(el).cloneNode(true);
	else if ($) return $(el).clone(true)[0];
	else return el.cloneNode(true);
}
function getChildContainingRectFromElement(container, options, ghostEl) {
	var rect = {};
	Array.from(container.children).forEach(function(child) {
		var _rect$left, _rect$top, _rect$right, _rect$bottom;
		if (!closest(child, options.draggable, container, false) || child.animated || child === ghostEl) return;
		var childRect = getRect(child);
		rect.left = Math.min((_rect$left = rect.left) !== null && _rect$left !== void 0 ? _rect$left : Infinity, childRect.left);
		rect.top = Math.min((_rect$top = rect.top) !== null && _rect$top !== void 0 ? _rect$top : Infinity, childRect.top);
		rect.right = Math.max((_rect$right = rect.right) !== null && _rect$right !== void 0 ? _rect$right : -Infinity, childRect.right);
		rect.bottom = Math.max((_rect$bottom = rect.bottom) !== null && _rect$bottom !== void 0 ? _rect$bottom : -Infinity, childRect.bottom);
	});
	rect.width = rect.right - rect.left;
	rect.height = rect.bottom - rect.top;
	rect.x = rect.left;
	rect.y = rect.top;
	return rect;
}
function AnimationStateManager() {
	var animationStates = [], animationCallbackId;
	return {
		captureAnimationState: function captureAnimationState() {
			animationStates = [];
			if (!this.options.animation) return;
			[].slice.call(this.el.children).forEach(function(child) {
				if (css(child, "display") === "none" || child === Sortable.ghost) return;
				animationStates.push({
					target: child,
					rect: getRect(child)
				});
				var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);
				if (child.thisAnimationDuration) {
					var childMatrix = matrix(child, true);
					if (childMatrix) {
						fromRect.top -= childMatrix.f;
						fromRect.left -= childMatrix.e;
					}
				}
				child.fromRect = fromRect;
			});
		},
		addAnimationState: function addAnimationState(state) {
			animationStates.push(state);
		},
		removeAnimationState: function removeAnimationState(target) {
			animationStates.splice(indexOfObject(animationStates, { target }), 1);
		},
		animateAll: function animateAll(callback) {
			var _this = this;
			if (!this.options.animation) {
				clearTimeout(animationCallbackId);
				if (typeof callback === "function") callback();
				return;
			}
			var animating = false, animationTime = 0;
			animationStates.forEach(function(state) {
				var time = 0, target = state.target, fromRect = target.fromRect, toRect = getRect(target), prevFromRect = target.prevFromRect, prevToRect = target.prevToRect, animatingRect = state.rect, targetMatrix = matrix(target, true);
				if (targetMatrix) {
					toRect.top -= targetMatrix.f;
					toRect.left -= targetMatrix.e;
				}
				target.toRect = toRect;
				if (target.thisAnimationDuration) {
					if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
				}
				if (!isRectEqual(toRect, fromRect)) {
					target.prevFromRect = fromRect;
					target.prevToRect = toRect;
					if (!time) time = _this.options.animation;
					_this.animate(target, animatingRect, toRect, time);
				}
				if (time) {
					animating = true;
					animationTime = Math.max(animationTime, time);
					clearTimeout(target.animationResetTimer);
					target.animationResetTimer = setTimeout(function() {
						target.animationTime = 0;
						target.prevFromRect = null;
						target.fromRect = null;
						target.prevToRect = null;
						target.thisAnimationDuration = null;
					}, time);
					target.thisAnimationDuration = time;
				}
			});
			clearTimeout(animationCallbackId);
			if (!animating) {
				if (typeof callback === "function") callback();
			} else animationCallbackId = setTimeout(function() {
				if (typeof callback === "function") callback();
			}, animationTime);
			animationStates = [];
		},
		animate: function animate(target, currentRect, toRect, duration) {
			if (duration) {
				css(target, "transition", "");
				css(target, "transform", "");
				var elMatrix = matrix(this.el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d, translateX = (currentRect.left - toRect.left) / (scaleX || 1), translateY = (currentRect.top - toRect.top) / (scaleY || 1);
				target.animatingX = !!translateX;
				target.animatingY = !!translateY;
				css(target, "transform", "translate3d(" + translateX + "px," + translateY + "px,0)");
				this.forRepaintDummy = repaint(target);
				css(target, "transition", "transform " + duration + "ms" + (this.options.easing ? " " + this.options.easing : ""));
				css(target, "transform", "translate3d(0,0,0)");
				typeof target.animated === "number" && clearTimeout(target.animated);
				target.animated = setTimeout(function() {
					css(target, "transition", "");
					css(target, "transform", "");
					target.animated = false;
					target.animatingX = false;
					target.animatingY = false;
				}, duration);
			}
		}
	};
}
function repaint(target) {
	return target.offsetWidth;
}
function calculateRealTime(animatingRect, fromRect, toRect, options) {
	return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
}
function dispatchEvent(_ref) {
	var sortable = _ref.sortable, rootEl = _ref.rootEl, name = _ref.name, targetEl = _ref.targetEl, cloneEl = _ref.cloneEl, toEl = _ref.toEl, fromEl = _ref.fromEl, oldIndex = _ref.oldIndex, newIndex = _ref.newIndex, oldDraggableIndex = _ref.oldDraggableIndex, newDraggableIndex = _ref.newDraggableIndex, originalEvent = _ref.originalEvent, putSortable = _ref.putSortable, extraEventProperties = _ref.extraEventProperties;
	sortable = sortable || rootEl && rootEl[expando];
	if (!sortable) return;
	var evt, options = sortable.options, onName = "on" + name.charAt(0).toUpperCase() + name.substr(1);
	if (window.CustomEvent && !IE11OrLess && !Edge) evt = new CustomEvent(name, {
		bubbles: true,
		cancelable: true
	});
	else {
		evt = document.createEvent("Event");
		evt.initEvent(name, true, true);
	}
	evt.to = toEl || rootEl;
	evt.from = fromEl || rootEl;
	evt.item = targetEl || rootEl;
	evt.clone = cloneEl;
	evt.oldIndex = oldIndex;
	evt.newIndex = newIndex;
	evt.oldDraggableIndex = oldDraggableIndex;
	evt.newDraggableIndex = newDraggableIndex;
	evt.originalEvent = originalEvent;
	evt.pullMode = putSortable ? putSortable.lastPutMode : void 0;
	var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name, sortable));
	for (var option in allEventProperties) evt[option] = allEventProperties[option];
	if (rootEl) rootEl.dispatchEvent(evt);
	if (options[onName]) options[onName].call(sortable, evt);
}
function _dispatchEvent(info) {
	dispatchEvent(_objectSpread2({
		putSortable,
		cloneEl,
		targetEl: dragEl,
		rootEl,
		oldIndex,
		oldDraggableIndex,
		newIndex,
		newDraggableIndex
	}, info));
}
/**
* @class  Sortable
* @param  {HTMLElement}  el
* @param  {Object}       [options]
*/
function Sortable(el, options) {
	if (!(el && el.nodeType && el.nodeType === 1)) throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
	this.el = el;
	this.options = options = _extends({}, options);
	el[expando] = this;
	var defaults = {
		group: null,
		sort: true,
		disabled: false,
		store: null,
		handle: null,
		draggable: /^[uo]l$/i.test(el.nodeName) ? ">li" : ">*",
		swapThreshold: 1,
		invertSwap: false,
		invertedSwapThreshold: null,
		removeCloneOnHide: true,
		direction: function direction() {
			return _detectDirection(el, this.options);
		},
		ghostClass: "sortable-ghost",
		chosenClass: "sortable-chosen",
		dragClass: "sortable-drag",
		ignore: "a, img",
		filter: null,
		preventOnFilter: true,
		animation: 0,
		easing: null,
		setData: function setData(dataTransfer, dragEl) {
			dataTransfer.setData("Text", dragEl.textContent);
		},
		dropBubble: false,
		dragoverBubble: false,
		dataIdAttr: "data-id",
		delay: 0,
		delayOnTouchOnly: false,
		touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
		forceFallback: false,
		fallbackClass: "sortable-fallback",
		fallbackOnBody: false,
		fallbackTolerance: 0,
		fallbackOffset: {
			x: 0,
			y: 0
		},
		supportPointer: Sortable.supportPointer !== false && "PointerEvent" in window && (!Safari || IOS),
		emptyInsertThreshold: 5
	};
	PluginManager.initializePlugins(this, el, defaults);
	for (var name in defaults) !(name in options) && (options[name] = defaults[name]);
	_prepareGroup(options);
	for (var fn in this) if (fn.charAt(0) === "_" && typeof this[fn] === "function") this[fn] = this[fn].bind(this);
	this.nativeDraggable = options.forceFallback ? false : supportDraggable;
	if (this.nativeDraggable) this.options.touchStartThreshold = 1;
	if (options.supportPointer) on(el, "pointerdown", this._onTapStart);
	else {
		on(el, "mousedown", this._onTapStart);
		on(el, "touchstart", this._onTapStart);
	}
	if (this.nativeDraggable) {
		on(el, "dragover", this);
		on(el, "dragenter", this);
	}
	sortables.push(this.el);
	options.store && options.store.get && this.sort(options.store.get(this) || []);
	_extends(this, AnimationStateManager());
}
function _globalDragOver(evt) {
	if (evt.dataTransfer) evt.dataTransfer.dropEffect = "move";
	evt.cancelable && evt.preventDefault();
}
function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
	var evt, sortable = fromEl[expando], onMoveFn = sortable.options.onMove, retVal;
	if (window.CustomEvent && !IE11OrLess && !Edge) evt = new CustomEvent("move", {
		bubbles: true,
		cancelable: true
	});
	else {
		evt = document.createEvent("Event");
		evt.initEvent("move", true, true);
	}
	evt.to = toEl;
	evt.from = fromEl;
	evt.dragged = dragEl;
	evt.draggedRect = dragRect;
	evt.related = targetEl || toEl;
	evt.relatedRect = targetRect || getRect(toEl);
	evt.willInsertAfter = willInsertAfter;
	evt.originalEvent = originalEvent;
	fromEl.dispatchEvent(evt);
	if (onMoveFn) retVal = onMoveFn.call(sortable, evt, originalEvent);
	return retVal;
}
function _disableDraggable(el) {
	el.draggable = false;
}
function _unsilent() {
	_silent = false;
}
function _ghostIsFirst(evt, vertical, sortable) {
	var firstElRect = getRect(getChild(sortable.el, 0, sortable.options, true));
	var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
	var spacer = 10;
	return vertical ? evt.clientX < childContainingRect.left - spacer || evt.clientY < firstElRect.top && evt.clientX < firstElRect.right : evt.clientY < childContainingRect.top - spacer || evt.clientY < firstElRect.bottom && evt.clientX < firstElRect.left;
}
function _ghostIsLast(evt, vertical, sortable) {
	var lastElRect = getRect(lastChild(sortable.el, sortable.options.draggable));
	var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
	var spacer = 10;
	return vertical ? evt.clientX > childContainingRect.right + spacer || evt.clientY > lastElRect.bottom && evt.clientX > lastElRect.left : evt.clientY > childContainingRect.bottom + spacer || evt.clientX > lastElRect.right && evt.clientY > lastElRect.top;
}
function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
	var mouseOnAxis = vertical ? evt.clientY : evt.clientX, targetLength = vertical ? targetRect.height : targetRect.width, targetS1 = vertical ? targetRect.top : targetRect.left, targetS2 = vertical ? targetRect.bottom : targetRect.right, invert = false;
	if (!invertSwap) {
		if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
			if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) pastFirstInvertThresh = true;
			if (!pastFirstInvertThresh) {
				if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance : mouseOnAxis > targetS2 - targetMoveDistance) return -lastDirection;
			} else invert = true;
		} else if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) return _getInsertDirection(target);
	}
	invert = invert || invertSwap;
	if (invert) {
		if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
	}
	return 0;
}
/**
* Gets the direction dragEl must be swapped relative to target in order to make it
* seem that dragEl has been "inserted" into that element's position
* @param  {HTMLElement} target       The target whose position dragEl is being inserted at
* @return {Number}                   Direction dragEl must be swapped
*/
function _getInsertDirection(target) {
	if (index(dragEl) < index(target)) return 1;
	else return -1;
}
/**
* Generate id
* @param   {HTMLElement} el
* @returns {String}
* @private
*/
function _generateId(el) {
	var str = el.tagName + el.className + el.src + el.href + el.textContent, i = str.length, sum = 0;
	while (i--) sum += str.charCodeAt(i);
	return sum.toString(36);
}
function _saveInputCheckedState(root) {
	savedInputChecked.length = 0;
	var inputs = root.getElementsByTagName("input");
	var idx = inputs.length;
	while (idx--) {
		var el = inputs[idx];
		el.checked && savedInputChecked.push(el);
	}
}
function _nextTick(fn) {
	return setTimeout(fn, 0);
}
function _cancelNextTick(id) {
	return clearTimeout(id);
}
function AutoScrollPlugin() {
	function AutoScroll() {
		this.defaults = {
			scroll: true,
			forceAutoScrollFallback: false,
			scrollSensitivity: 30,
			scrollSpeed: 10,
			bubbleScroll: true
		};
		for (var fn in this) if (fn.charAt(0) === "_" && typeof this[fn] === "function") this[fn] = this[fn].bind(this);
	}
	AutoScroll.prototype = {
		dragStarted: function dragStarted(_ref) {
			var originalEvent = _ref.originalEvent;
			if (this.sortable.nativeDraggable) on(document, "dragover", this._handleAutoScroll);
			else if (this.options.supportPointer) on(document, "pointermove", this._handleFallbackAutoScroll);
			else if (originalEvent.touches) on(document, "touchmove", this._handleFallbackAutoScroll);
			else on(document, "mousemove", this._handleFallbackAutoScroll);
		},
		dragOverCompleted: function dragOverCompleted(_ref2) {
			var originalEvent = _ref2.originalEvent;
			if (!this.options.dragOverBubble && !originalEvent.rootEl) this._handleAutoScroll(originalEvent);
		},
		drop: function drop() {
			if (this.sortable.nativeDraggable) off(document, "dragover", this._handleAutoScroll);
			else {
				off(document, "pointermove", this._handleFallbackAutoScroll);
				off(document, "touchmove", this._handleFallbackAutoScroll);
				off(document, "mousemove", this._handleFallbackAutoScroll);
			}
			clearPointerElemChangedInterval();
			clearAutoScrolls();
			cancelThrottle();
		},
		nulling: function nulling() {
			touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
			autoScrolls.length = 0;
		},
		_handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
			this._handleAutoScroll(evt, true);
		},
		_handleAutoScroll: function _handleAutoScroll(evt, fallback) {
			var _this = this;
			var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, elem = document.elementFromPoint(x, y);
			touchEvt$1 = evt;
			if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
				autoScroll(evt, this.options, elem, fallback);
				var ogElemScroller = getParentAutoScrollElement(elem, true);
				if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
					pointerElemChangedInterval && clearPointerElemChangedInterval();
					pointerElemChangedInterval = setInterval(function() {
						var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
						if (newElem !== ogElemScroller) {
							ogElemScroller = newElem;
							clearAutoScrolls();
						}
						autoScroll(evt, _this.options, newElem, fallback);
					}, 10);
					lastAutoScrollX = x;
					lastAutoScrollY = y;
				}
			} else {
				if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
					clearAutoScrolls();
					return;
				}
				autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
			}
		}
	};
	return _extends(AutoScroll, {
		pluginName: "scroll",
		initializeByDefault: true
	});
}
function clearAutoScrolls() {
	autoScrolls.forEach(function(autoScroll) {
		clearInterval(autoScroll.pid);
	});
	autoScrolls = [];
}
function clearPointerElemChangedInterval() {
	clearInterval(pointerElemChangedInterval);
}
function Revert() {}
function Remove() {}
var version, IE11OrLess, Edge, FireFox, Safari, IOS, ChromeForAndroid, captureMode, R_SPACE, _throttleTimeout, expando, plugins, defaults$4, PluginManager, _excluded, pluginEvent, dragEl, parentEl, ghostEl, rootEl, nextEl, lastDownEl, cloneEl, cloneHidden, oldIndex, newIndex, oldDraggableIndex, newDraggableIndex, activeGroup, putSortable, awaitingDragStarted, ignoreNextClick, sortables, tapEvt, touchEvt, lastDx, lastDy, tapDistanceLeft, tapDistanceTop, moved, lastTarget, lastDirection, pastFirstInvertThresh, isCircumstantialInvert, targetMoveDistance, ghostRelativeParent, ghostRelativeParentInitialScroll, _silent, savedInputChecked, documentExists, PositionGhostAbsolutely, CSSFloatProperty, supportDraggable, supportCssPointerEvents, _detectDirection, _dragElInRowColumn, _detectNearestEmptySortable, _prepareGroup, _hideGhostForTarget, _unhideGhostForTarget, nearestEmptyInsertDetectEvent, _checkOutsideTargetEl, autoScrolls, scrollEl, scrollRootEl, scrolling, lastAutoScrollX, lastAutoScrollY, touchEvt$1, pointerElemChangedInterval, autoScroll, drop;
var init_sortable_esm = __esmMin((() => {
	version = "1.15.7";
	IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
	Edge = userAgent(/Edge/i);
	FireFox = userAgent(/firefox/i);
	Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
	IOS = userAgent(/iP(ad|od|hone)/i);
	ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
	captureMode = {
		capture: false,
		passive: false
	};
	R_SPACE = /\s+/g;
	expando = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
	plugins = [];
	defaults$4 = { initializeByDefault: true };
	PluginManager = {
		mount: function mount(plugin) {
			for (var option in defaults$4) if (defaults$4.hasOwnProperty(option) && !(option in plugin)) plugin[option] = defaults$4[option];
			plugins.forEach(function(p) {
				if (p.pluginName === plugin.pluginName) throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
			});
			plugins.push(plugin);
		},
		pluginEvent: function pluginEvent(eventName, sortable, evt) {
			var _this = this;
			this.eventCanceled = false;
			evt.cancel = function() {
				_this.eventCanceled = true;
			};
			var eventNameGlobal = eventName + "Global";
			plugins.forEach(function(plugin) {
				if (!sortable[plugin.pluginName]) return;
				if (sortable[plugin.pluginName][eventNameGlobal]) sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({ sortable }, evt));
				if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) sortable[plugin.pluginName][eventName](_objectSpread2({ sortable }, evt));
			});
		},
		initializePlugins: function initializePlugins(sortable, el, defaults, options) {
			plugins.forEach(function(plugin) {
				var pluginName = plugin.pluginName;
				if (!sortable.options[pluginName] && !plugin.initializeByDefault) return;
				var initialized = new plugin(sortable, el, sortable.options);
				initialized.sortable = sortable;
				initialized.options = sortable.options;
				sortable[pluginName] = initialized;
				_extends(defaults, initialized.defaults);
			});
			for (var option in sortable.options) {
				if (!sortable.options.hasOwnProperty(option)) continue;
				var modified = this.modifyOption(sortable, option, sortable.options[option]);
				if (typeof modified !== "undefined") sortable.options[option] = modified;
			}
		},
		getEventProperties: function getEventProperties(name, sortable) {
			var eventProperties = {};
			plugins.forEach(function(plugin) {
				if (typeof plugin.eventProperties !== "function") return;
				_extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
			});
			return eventProperties;
		},
		modifyOption: function modifyOption(sortable, name, value) {
			var modifiedValue;
			plugins.forEach(function(plugin) {
				if (!sortable[plugin.pluginName]) return;
				if (plugin.optionListeners && typeof plugin.optionListeners[name] === "function") modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
			});
			return modifiedValue;
		}
	};
	_excluded = ["evt"];
	pluginEvent = function pluginEvent(eventName, sortable) {
		var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, originalEvent = _ref.evt, data = _objectWithoutProperties(_ref, _excluded);
		PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread2({
			dragEl,
			parentEl,
			ghostEl,
			rootEl,
			nextEl,
			lastDownEl,
			cloneEl,
			cloneHidden,
			dragStarted: moved,
			putSortable,
			activeSortable: Sortable.active,
			originalEvent,
			oldIndex,
			oldDraggableIndex,
			newIndex,
			newDraggableIndex,
			hideGhostForTarget: _hideGhostForTarget,
			unhideGhostForTarget: _unhideGhostForTarget,
			cloneNowHidden: function cloneNowHidden() {
				cloneHidden = true;
			},
			cloneNowShown: function cloneNowShown() {
				cloneHidden = false;
			},
			dispatchSortableEvent: function dispatchSortableEvent(name) {
				_dispatchEvent({
					sortable,
					name,
					originalEvent
				});
			}
		}, data));
	};
	awaitingDragStarted = false, ignoreNextClick = false, sortables = [], pastFirstInvertThresh = false, isCircumstantialInvert = false, ghostRelativeParentInitialScroll = [], _silent = false, savedInputChecked = [];
	documentExists = typeof document !== "undefined", PositionGhostAbsolutely = IOS, CSSFloatProperty = Edge || IE11OrLess ? "cssFloat" : "float", supportDraggable = documentExists && !ChromeForAndroid && !IOS && "draggable" in document.createElement("div"), supportCssPointerEvents = function() {
		if (!documentExists) return;
		if (IE11OrLess) return false;
		var el = document.createElement("x");
		el.style.cssText = "pointer-events:auto";
		return el.style.pointerEvents === "auto";
	}(), _detectDirection = function _detectDirection(el, options) {
		var elCSS = css(el), elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth), child1 = getChild(el, 0, options), child2 = getChild(el, 1, options), firstChildCSS = child1 && css(child1), secondChildCSS = child2 && css(child2), firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width, secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
		if (elCSS.display === "flex") return elCSS.flexDirection === "column" || elCSS.flexDirection === "column-reverse" ? "vertical" : "horizontal";
		if (elCSS.display === "grid") return elCSS.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
		if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== "none") {
			var touchingSideChild2 = firstChildCSS["float"] === "left" ? "left" : "right";
			return child2 && (secondChildCSS.clear === "both" || secondChildCSS.clear === touchingSideChild2) ? "vertical" : "horizontal";
		}
		return child1 && (firstChildCSS.display === "block" || firstChildCSS.display === "flex" || firstChildCSS.display === "table" || firstChildCSS.display === "grid" || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === "none" || child2 && elCSS[CSSFloatProperty] === "none" && firstChildWidth + secondChildWidth > elWidth) ? "vertical" : "horizontal";
	}, _dragElInRowColumn = function _dragElInRowColumn(dragRect, targetRect, vertical) {
		var dragElS1Opp = vertical ? dragRect.left : dragRect.top, dragElS2Opp = vertical ? dragRect.right : dragRect.bottom, dragElOppLength = vertical ? dragRect.width : dragRect.height, targetS1Opp = vertical ? targetRect.left : targetRect.top, targetS2Opp = vertical ? targetRect.right : targetRect.bottom, targetOppLength = vertical ? targetRect.width : targetRect.height;
		return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
	}, _detectNearestEmptySortable = function _detectNearestEmptySortable(x, y) {
		var ret;
		sortables.some(function(sortable) {
			var threshold = sortable[expando].options.emptyInsertThreshold;
			if (!threshold || lastChild(sortable)) return;
			var rect = getRect(sortable), insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold, insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
			if (insideHorizontally && insideVertically) return ret = sortable;
		});
		return ret;
	}, _prepareGroup = function _prepareGroup(options) {
		function toFn(value, pull) {
			return function(to, from, dragEl, evt) {
				var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
				if (value == null && (pull || sameGroup)) return true;
				else if (value == null || value === false) return false;
				else if (pull && value === "clone") return value;
				else if (typeof value === "function") return toFn(value(to, from, dragEl, evt), pull)(to, from, dragEl, evt);
				else {
					var otherGroup = (pull ? to : from).options.group.name;
					return value === true || typeof value === "string" && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
				}
			};
		}
		var group = {};
		var originalGroup = options.group;
		if (!originalGroup || _typeof(originalGroup) != "object") originalGroup = { name: originalGroup };
		group.name = originalGroup.name;
		group.checkPull = toFn(originalGroup.pull, true);
		group.checkPut = toFn(originalGroup.put);
		group.revertClone = originalGroup.revertClone;
		options.group = group;
	}, _hideGhostForTarget = function _hideGhostForTarget() {
		if (!supportCssPointerEvents && ghostEl) css(ghostEl, "display", "none");
	}, _unhideGhostForTarget = function _unhideGhostForTarget() {
		if (!supportCssPointerEvents && ghostEl) css(ghostEl, "display", "");
	};
	if (documentExists && !ChromeForAndroid) document.addEventListener("click", function(evt) {
		if (ignoreNextClick) {
			evt.preventDefault();
			evt.stopPropagation && evt.stopPropagation();
			evt.stopImmediatePropagation && evt.stopImmediatePropagation();
			ignoreNextClick = false;
			return false;
		}
	}, true);
	nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent(evt) {
		if (dragEl) {
			evt = evt.touches ? evt.touches[0] : evt;
			var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
			if (nearest) {
				var event = {};
				for (var i in evt) if (evt.hasOwnProperty(i)) event[i] = evt[i];
				event.target = event.rootEl = nearest;
				event.preventDefault = void 0;
				event.stopPropagation = void 0;
				nearest[expando]._onDragOver(event);
			}
		}
	};
	_checkOutsideTargetEl = function _checkOutsideTargetEl(evt) {
		if (dragEl) dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
	};
	Sortable.prototype = (	/** @lends Sortable.prototype */ {
		constructor: Sortable,
		_isOutsideThisEl: function _isOutsideThisEl(target) {
			if (!this.el.contains(target) && target !== this.el) lastTarget = null;
		},
		_getDirection: function _getDirection(evt, target) {
			return typeof this.options.direction === "function" ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
		},
		_onTapStart: function _onTapStart(evt) {
			if (!evt.cancelable) return;
			var _this = this, el = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter = options.filter;
			_saveInputCheckedState(el);
			if (dragEl) return;
			if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) return;
			if (originalTarget.isContentEditable) return;
			if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === "SELECT") return;
			target = closest(target, options.draggable, el, false);
			if (target && target.animated) return;
			if (lastDownEl === target) return;
			oldIndex = index(target);
			oldDraggableIndex = index(target, options.draggable);
			if (typeof filter === "function") {
				if (filter.call(this, evt, target, this)) {
					_dispatchEvent({
						sortable: _this,
						rootEl: originalTarget,
						name: "filter",
						targetEl: target,
						toEl: el,
						fromEl: el
					});
					pluginEvent("filter", _this, { evt });
					preventOnFilter && evt.preventDefault();
					return;
				}
			} else if (filter) {
				filter = filter.split(",").some(function(criteria) {
					criteria = closest(originalTarget, criteria.trim(), el, false);
					if (criteria) {
						_dispatchEvent({
							sortable: _this,
							rootEl: criteria,
							name: "filter",
							targetEl: target,
							fromEl: el,
							toEl: el
						});
						pluginEvent("filter", _this, { evt });
						return true;
					}
				});
				if (filter) {
					preventOnFilter && evt.preventDefault();
					return;
				}
			}
			if (options.handle && !closest(originalTarget, options.handle, el, false)) return;
			this._prepareDragStart(evt, touch, target);
		},
		_prepareDragStart: function _prepareDragStart(evt, touch, target) {
			var _this = this, el = _this.el, options = _this.options, ownerDocument = el.ownerDocument, dragStartFn;
			if (target && !dragEl && target.parentNode === el) {
				var dragRect = getRect(target);
				rootEl = el;
				dragEl = target;
				parentEl = dragEl.parentNode;
				nextEl = dragEl.nextSibling;
				lastDownEl = target;
				activeGroup = options.group;
				Sortable.dragged = dragEl;
				tapEvt = {
					target: dragEl,
					clientX: (touch || evt).clientX,
					clientY: (touch || evt).clientY
				};
				tapDistanceLeft = tapEvt.clientX - dragRect.left;
				tapDistanceTop = tapEvt.clientY - dragRect.top;
				this._lastX = (touch || evt).clientX;
				this._lastY = (touch || evt).clientY;
				dragEl.style["will-change"] = "all";
				dragStartFn = function dragStartFn() {
					pluginEvent("delayEnded", _this, { evt });
					if (Sortable.eventCanceled) {
						_this._onDrop();
						return;
					}
					_this._disableDelayedDragEvents();
					if (!FireFox && _this.nativeDraggable) dragEl.draggable = true;
					_this._triggerDragStart(evt, touch);
					_dispatchEvent({
						sortable: _this,
						name: "choose",
						originalEvent: evt
					});
					toggleClass(dragEl, options.chosenClass, true);
				};
				options.ignore.split(",").forEach(function(criteria) {
					find(dragEl, criteria.trim(), _disableDraggable);
				});
				on(ownerDocument, "dragover", nearestEmptyInsertDetectEvent);
				on(ownerDocument, "mousemove", nearestEmptyInsertDetectEvent);
				on(ownerDocument, "touchmove", nearestEmptyInsertDetectEvent);
				if (options.supportPointer) {
					on(ownerDocument, "pointerup", _this._onDrop);
					!this.nativeDraggable && on(ownerDocument, "pointercancel", _this._onDrop);
				} else {
					on(ownerDocument, "mouseup", _this._onDrop);
					on(ownerDocument, "touchend", _this._onDrop);
					on(ownerDocument, "touchcancel", _this._onDrop);
				}
				if (FireFox && this.nativeDraggable) {
					this.options.touchStartThreshold = 4;
					dragEl.draggable = true;
				}
				pluginEvent("delayStart", this, { evt });
				if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
					if (Sortable.eventCanceled) {
						this._onDrop();
						return;
					}
					if (options.supportPointer) {
						on(ownerDocument, "pointerup", _this._disableDelayedDrag);
						on(ownerDocument, "pointercancel", _this._disableDelayedDrag);
					} else {
						on(ownerDocument, "mouseup", _this._disableDelayedDrag);
						on(ownerDocument, "touchend", _this._disableDelayedDrag);
						on(ownerDocument, "touchcancel", _this._disableDelayedDrag);
					}
					on(ownerDocument, "mousemove", _this._delayedDragTouchMoveHandler);
					on(ownerDocument, "touchmove", _this._delayedDragTouchMoveHandler);
					options.supportPointer && on(ownerDocument, "pointermove", _this._delayedDragTouchMoveHandler);
					_this._dragStartTimer = setTimeout(dragStartFn, options.delay);
				} else dragStartFn();
			}
		},
		_delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e) {
			var touch = e.touches ? e.touches[0] : e;
			if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) this._disableDelayedDrag();
		},
		_disableDelayedDrag: function _disableDelayedDrag() {
			dragEl && _disableDraggable(dragEl);
			clearTimeout(this._dragStartTimer);
			this._disableDelayedDragEvents();
		},
		_disableDelayedDragEvents: function _disableDelayedDragEvents() {
			var ownerDocument = this.el.ownerDocument;
			off(ownerDocument, "mouseup", this._disableDelayedDrag);
			off(ownerDocument, "touchend", this._disableDelayedDrag);
			off(ownerDocument, "touchcancel", this._disableDelayedDrag);
			off(ownerDocument, "pointerup", this._disableDelayedDrag);
			off(ownerDocument, "pointercancel", this._disableDelayedDrag);
			off(ownerDocument, "mousemove", this._delayedDragTouchMoveHandler);
			off(ownerDocument, "touchmove", this._delayedDragTouchMoveHandler);
			off(ownerDocument, "pointermove", this._delayedDragTouchMoveHandler);
		},
		_triggerDragStart: function _triggerDragStart(evt, touch) {
			touch = touch || evt.pointerType == "touch" && evt;
			if (!this.nativeDraggable || touch) if (this.options.supportPointer) on(document, "pointermove", this._onTouchMove);
			else if (touch) on(document, "touchmove", this._onTouchMove);
			else on(document, "mousemove", this._onTouchMove);
			else {
				on(dragEl, "dragend", this);
				on(rootEl, "dragstart", this._onDragStart);
			}
			try {
				if (document.selection) _nextTick(function() {
					document.selection.empty();
				});
				else window.getSelection().removeAllRanges();
			} catch (err) {}
		},
		_dragStarted: function _dragStarted(fallback, evt) {
			awaitingDragStarted = false;
			if (rootEl && dragEl) {
				pluginEvent("dragStarted", this, { evt });
				if (this.nativeDraggable) on(document, "dragover", _checkOutsideTargetEl);
				var options = this.options;
				!fallback && toggleClass(dragEl, options.dragClass, false);
				toggleClass(dragEl, options.ghostClass, true);
				Sortable.active = this;
				fallback && this._appendGhost();
				_dispatchEvent({
					sortable: this,
					name: "start",
					originalEvent: evt
				});
			} else this._nulling();
		},
		_emulateDragOver: function _emulateDragOver() {
			if (touchEvt) {
				this._lastX = touchEvt.clientX;
				this._lastY = touchEvt.clientY;
				_hideGhostForTarget();
				var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
				var parent = target;
				while (target && target.shadowRoot) {
					target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
					if (target === parent) break;
					parent = target;
				}
				dragEl.parentNode[expando]._isOutsideThisEl(target);
				if (parent) do {
					if (parent[expando]) {
						var inserted = void 0;
						inserted = parent[expando]._onDragOver({
							clientX: touchEvt.clientX,
							clientY: touchEvt.clientY,
							target,
							rootEl: parent
						});
						if (inserted && !this.options.dragoverBubble) break;
					}
					target = parent;
				} while (parent = getParentOrHost(parent));
				_unhideGhostForTarget();
			}
		},
		_onTouchMove: function _onTouchMove(evt) {
			if (tapEvt) {
				var options = this.options, fallbackTolerance = options.fallbackTolerance, fallbackOffset = options.fallbackOffset, touch = evt.touches ? evt.touches[0] : evt, ghostMatrix = ghostEl && matrix(ghostEl, true), scaleX = ghostEl && ghostMatrix && ghostMatrix.a, scaleY = ghostEl && ghostMatrix && ghostMatrix.d, relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent), dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1), dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);
				if (!Sortable.active && !awaitingDragStarted) {
					if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) return;
					this._onDragStart(evt, true);
				}
				if (ghostEl) {
					if (ghostMatrix) {
						ghostMatrix.e += dx - (lastDx || 0);
						ghostMatrix.f += dy - (lastDy || 0);
					} else ghostMatrix = {
						a: 1,
						b: 0,
						c: 0,
						d: 1,
						e: dx,
						f: dy
					};
					var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
					css(ghostEl, "webkitTransform", cssMatrix);
					css(ghostEl, "mozTransform", cssMatrix);
					css(ghostEl, "msTransform", cssMatrix);
					css(ghostEl, "transform", cssMatrix);
					lastDx = dx;
					lastDy = dy;
					touchEvt = touch;
				}
				evt.cancelable && evt.preventDefault();
			}
		},
		_appendGhost: function _appendGhost() {
			if (!ghostEl) {
				var container = this.options.fallbackOnBody ? document.body : rootEl, rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container), options = this.options;
				if (PositionGhostAbsolutely) {
					ghostRelativeParent = container;
					while (css(ghostRelativeParent, "position") === "static" && css(ghostRelativeParent, "transform") === "none" && ghostRelativeParent !== document) ghostRelativeParent = ghostRelativeParent.parentNode;
					if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
						if (ghostRelativeParent === document) ghostRelativeParent = getWindowScrollingElement();
						rect.top += ghostRelativeParent.scrollTop;
						rect.left += ghostRelativeParent.scrollLeft;
					} else ghostRelativeParent = getWindowScrollingElement();
					ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
				}
				ghostEl = dragEl.cloneNode(true);
				toggleClass(ghostEl, options.ghostClass, false);
				toggleClass(ghostEl, options.fallbackClass, true);
				toggleClass(ghostEl, options.dragClass, true);
				css(ghostEl, "transition", "");
				css(ghostEl, "transform", "");
				css(ghostEl, "box-sizing", "border-box");
				css(ghostEl, "margin", 0);
				css(ghostEl, "top", rect.top);
				css(ghostEl, "left", rect.left);
				css(ghostEl, "width", rect.width);
				css(ghostEl, "height", rect.height);
				css(ghostEl, "opacity", "0.8");
				css(ghostEl, "position", PositionGhostAbsolutely ? "absolute" : "fixed");
				css(ghostEl, "zIndex", "100000");
				css(ghostEl, "pointerEvents", "none");
				Sortable.ghost = ghostEl;
				container.appendChild(ghostEl);
				css(ghostEl, "transform-origin", tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + "% " + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + "%");
			}
		},
		_onDragStart: function _onDragStart(evt, fallback) {
			var _this = this;
			var dataTransfer = evt.dataTransfer;
			var options = _this.options;
			pluginEvent("dragStart", this, { evt });
			if (Sortable.eventCanceled) {
				this._onDrop();
				return;
			}
			pluginEvent("setupClone", this);
			if (!Sortable.eventCanceled) {
				cloneEl = clone(dragEl);
				cloneEl.removeAttribute("id");
				cloneEl.draggable = false;
				cloneEl.style["will-change"] = "";
				this._hideClone();
				toggleClass(cloneEl, this.options.chosenClass, false);
				Sortable.clone = cloneEl;
			}
			_this.cloneId = _nextTick(function() {
				pluginEvent("clone", _this);
				if (Sortable.eventCanceled) return;
				if (!_this.options.removeCloneOnHide) rootEl.insertBefore(cloneEl, dragEl);
				_this._hideClone();
				_dispatchEvent({
					sortable: _this,
					name: "clone"
				});
			});
			!fallback && toggleClass(dragEl, options.dragClass, true);
			if (fallback) {
				ignoreNextClick = true;
				_this._loopId = setInterval(_this._emulateDragOver, 50);
			} else {
				off(document, "mouseup", _this._onDrop);
				off(document, "touchend", _this._onDrop);
				off(document, "touchcancel", _this._onDrop);
				if (dataTransfer) {
					dataTransfer.effectAllowed = "move";
					options.setData && options.setData.call(_this, dataTransfer, dragEl);
				}
				on(document, "drop", _this);
				css(dragEl, "transform", "translateZ(0)");
			}
			awaitingDragStarted = true;
			_this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
			on(document, "selectstart", _this);
			moved = true;
			window.getSelection().removeAllRanges();
			if (Safari) css(document.body, "user-select", "none");
		},
		_onDragOver: function _onDragOver(evt) {
			var el = this.el, target = evt.target, dragRect, targetRect, revert, options = this.options, group = options.group, activeSortable = Sortable.active, isOwner = activeGroup === group, canSort = options.sort, fromSortable = putSortable || activeSortable, vertical, _this = this, completedFired = false;
			if (_silent) return;
			function dragOverEvent(name, extra) {
				pluginEvent(name, _this, _objectSpread2({
					evt,
					isOwner,
					axis: vertical ? "vertical" : "horizontal",
					revert,
					dragRect,
					targetRect,
					canSort,
					fromSortable,
					target,
					completed,
					onMove: function onMove(target, after) {
						return _onMove(rootEl, el, dragEl, dragRect, target, getRect(target), evt, after);
					},
					changed
				}, extra));
			}
			function capture() {
				dragOverEvent("dragOverAnimationCapture");
				_this.captureAnimationState();
				if (_this !== fromSortable) fromSortable.captureAnimationState();
			}
			function completed(insertion) {
				dragOverEvent("dragOverCompleted", { insertion });
				if (insertion) {
					if (isOwner) activeSortable._hideClone();
					else activeSortable._showClone(_this);
					if (_this !== fromSortable) {
						toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
						toggleClass(dragEl, options.ghostClass, true);
					}
					if (putSortable !== _this && _this !== Sortable.active) putSortable = _this;
					else if (_this === Sortable.active && putSortable) putSortable = null;
					if (fromSortable === _this) _this._ignoreWhileAnimating = target;
					_this.animateAll(function() {
						dragOverEvent("dragOverAnimationComplete");
						_this._ignoreWhileAnimating = null;
					});
					if (_this !== fromSortable) {
						fromSortable.animateAll();
						fromSortable._ignoreWhileAnimating = null;
					}
				}
				if (target === dragEl && !dragEl.animated || target === el && !target.animated) lastTarget = null;
				if (!options.dragoverBubble && !evt.rootEl && target !== document) {
					dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
					!insertion && nearestEmptyInsertDetectEvent(evt);
				}
				!options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
				return completedFired = true;
			}
			function changed() {
				newIndex = index(dragEl);
				newDraggableIndex = index(dragEl, options.draggable);
				_dispatchEvent({
					sortable: _this,
					name: "change",
					toEl: el,
					newIndex,
					newDraggableIndex,
					originalEvent: evt
				});
			}
			if (evt.preventDefault !== void 0) evt.cancelable && evt.preventDefault();
			target = closest(target, options.draggable, el, true);
			dragOverEvent("dragOver");
			if (Sortable.eventCanceled) return completedFired;
			if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) return completed(false);
			ignoreNextClick = false;
			if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
				vertical = this._getDirection(evt, target) === "vertical";
				dragRect = getRect(dragEl);
				dragOverEvent("dragOverValid");
				if (Sortable.eventCanceled) return completedFired;
				if (revert) {
					parentEl = rootEl;
					capture();
					this._hideClone();
					dragOverEvent("revert");
					if (!Sortable.eventCanceled) if (nextEl) rootEl.insertBefore(dragEl, nextEl);
					else rootEl.appendChild(dragEl);
					return completed(true);
				}
				var elLastChild = lastChild(el, options.draggable);
				if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
					if (elLastChild === dragEl) return completed(false);
					if (elLastChild && el === evt.target) target = elLastChild;
					if (target) targetRect = getRect(target);
					if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
						capture();
						if (elLastChild && elLastChild.nextSibling) el.insertBefore(dragEl, elLastChild.nextSibling);
						else el.appendChild(dragEl);
						parentEl = el;
						changed();
						return completed(true);
					}
				} else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
					var firstChild = getChild(el, 0, options, true);
					if (firstChild === dragEl) return completed(false);
					target = firstChild;
					targetRect = getRect(target);
					if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, false) !== false) {
						capture();
						el.insertBefore(dragEl, firstChild);
						parentEl = el;
						changed();
						return completed(true);
					}
				} else if (target.parentNode === el) {
					targetRect = getRect(target);
					var direction = 0, targetBeforeFirstSwap, differentLevel = dragEl.parentNode !== el, differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical), side1 = vertical ? "top" : "left", scrolledPastTop = isScrolledPast(target, "top", "top") || isScrolledPast(dragEl, "top", "top"), scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
					if (lastTarget !== target) {
						targetBeforeFirstSwap = targetRect[side1];
						pastFirstInvertThresh = false;
						isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
					}
					direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
					var sibling;
					if (direction !== 0) {
						var dragIndex = index(dragEl);
						do {
							dragIndex -= direction;
							sibling = parentEl.children[dragIndex];
						} while (sibling && (css(sibling, "display") === "none" || sibling === ghostEl));
					}
					if (direction === 0 || sibling === target) return completed(false);
					lastTarget = target;
					lastDirection = direction;
					var nextSibling = target.nextElementSibling, after = false;
					after = direction === 1;
					var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
					if (moveVector !== false) {
						if (moveVector === 1 || moveVector === -1) after = moveVector === 1;
						_silent = true;
						setTimeout(_unsilent, 30);
						capture();
						if (after && !nextSibling) el.appendChild(dragEl);
						else target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
						if (scrolledPastTop) scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
						parentEl = dragEl.parentNode;
						if (targetBeforeFirstSwap !== void 0 && !isCircumstantialInvert) targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
						changed();
						return completed(true);
					}
				}
				if (el.contains(dragEl)) return completed(false);
			}
			return false;
		},
		_ignoreWhileAnimating: null,
		_offMoveEvents: function _offMoveEvents() {
			off(document, "mousemove", this._onTouchMove);
			off(document, "touchmove", this._onTouchMove);
			off(document, "pointermove", this._onTouchMove);
			off(document, "dragover", nearestEmptyInsertDetectEvent);
			off(document, "mousemove", nearestEmptyInsertDetectEvent);
			off(document, "touchmove", nearestEmptyInsertDetectEvent);
		},
		_offUpEvents: function _offUpEvents() {
			var ownerDocument = this.el.ownerDocument;
			off(ownerDocument, "mouseup", this._onDrop);
			off(ownerDocument, "touchend", this._onDrop);
			off(ownerDocument, "pointerup", this._onDrop);
			off(ownerDocument, "pointercancel", this._onDrop);
			off(ownerDocument, "touchcancel", this._onDrop);
			off(document, "selectstart", this);
		},
		_onDrop: function _onDrop(evt) {
			var el = this.el, options = this.options;
			newIndex = index(dragEl);
			newDraggableIndex = index(dragEl, options.draggable);
			pluginEvent("drop", this, { evt });
			parentEl = dragEl && dragEl.parentNode;
			newIndex = index(dragEl);
			newDraggableIndex = index(dragEl, options.draggable);
			if (Sortable.eventCanceled) {
				this._nulling();
				return;
			}
			awaitingDragStarted = false;
			isCircumstantialInvert = false;
			pastFirstInvertThresh = false;
			clearInterval(this._loopId);
			clearTimeout(this._dragStartTimer);
			_cancelNextTick(this.cloneId);
			_cancelNextTick(this._dragStartId);
			if (this.nativeDraggable) {
				off(document, "drop", this);
				off(el, "dragstart", this._onDragStart);
			}
			this._offMoveEvents();
			this._offUpEvents();
			if (Safari) css(document.body, "user-select", "");
			css(dragEl, "transform", "");
			if (evt) {
				if (moved) {
					evt.cancelable && evt.preventDefault();
					!options.dropBubble && evt.stopPropagation();
				}
				ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
				if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== "clone") cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
				if (dragEl) {
					if (this.nativeDraggable) off(dragEl, "dragend", this);
					_disableDraggable(dragEl);
					dragEl.style["will-change"] = "";
					if (moved && !awaitingDragStarted) toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
					toggleClass(dragEl, this.options.chosenClass, false);
					_dispatchEvent({
						sortable: this,
						name: "unchoose",
						toEl: parentEl,
						newIndex: null,
						newDraggableIndex: null,
						originalEvent: evt
					});
					if (rootEl !== parentEl) {
						if (newIndex >= 0) {
							_dispatchEvent({
								rootEl: parentEl,
								name: "add",
								toEl: parentEl,
								fromEl: rootEl,
								originalEvent: evt
							});
							_dispatchEvent({
								sortable: this,
								name: "remove",
								toEl: parentEl,
								originalEvent: evt
							});
							_dispatchEvent({
								rootEl: parentEl,
								name: "sort",
								toEl: parentEl,
								fromEl: rootEl,
								originalEvent: evt
							});
							_dispatchEvent({
								sortable: this,
								name: "sort",
								toEl: parentEl,
								originalEvent: evt
							});
						}
						putSortable && putSortable.save();
					} else if (newIndex !== oldIndex) {
						if (newIndex >= 0) {
							_dispatchEvent({
								sortable: this,
								name: "update",
								toEl: parentEl,
								originalEvent: evt
							});
							_dispatchEvent({
								sortable: this,
								name: "sort",
								toEl: parentEl,
								originalEvent: evt
							});
						}
					}
					if (Sortable.active) {
						if (newIndex == null || newIndex === -1) {
							newIndex = oldIndex;
							newDraggableIndex = oldDraggableIndex;
						}
						_dispatchEvent({
							sortable: this,
							name: "end",
							toEl: parentEl,
							originalEvent: evt
						});
						this.save();
					}
				}
			}
			this._nulling();
		},
		_nulling: function _nulling() {
			pluginEvent("nulling", this);
			rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
			var el = this.el;
			savedInputChecked.forEach(function(checkEl) {
				if (el.contains(checkEl)) checkEl.checked = true;
			});
			savedInputChecked.length = lastDx = lastDy = 0;
		},
		handleEvent: function handleEvent(evt) {
			switch (evt.type) {
				case "drop":
				case "dragend":
					this._onDrop(evt);
					break;
				case "dragenter":
				case "dragover":
					if (dragEl) {
						this._onDragOver(evt);
						_globalDragOver(evt);
					}
					break;
				case "selectstart":
					evt.preventDefault();
					break;
			}
		},
		/**
		* Serializes the item into an array of string.
		* @returns {String[]}
		*/
		toArray: function toArray() {
			var order = [], el, children = this.el.children, i = 0, n = children.length, options = this.options;
			for (; i < n; i++) {
				el = children[i];
				if (closest(el, options.draggable, this.el, false)) order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
			}
			return order;
		},
		/**
		* Sorts the elements according to the array.
		* @param  {String[]}  order  order of the items
		*/
		sort: function sort(order, useAnimation) {
			var items = {}, rootEl = this.el;
			this.toArray().forEach(function(id, i) {
				var el = rootEl.children[i];
				if (closest(el, this.options.draggable, rootEl, false)) items[id] = el;
			}, this);
			useAnimation && this.captureAnimationState();
			order.forEach(function(id) {
				if (items[id]) {
					rootEl.removeChild(items[id]);
					rootEl.appendChild(items[id]);
				}
			});
			useAnimation && this.animateAll();
		},
		/**
		* Save the current sorting
		*/
		save: function save() {
			var store = this.options.store;
			store && store.set && store.set(this);
		},
		/**
		* For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
		* @param   {HTMLElement}  el
		* @param   {String}       [selector]  default: `options.draggable`
		* @returns {HTMLElement|null}
		*/
		closest: function closest$1(el, selector) {
			return closest(el, selector || this.options.draggable, this.el, false);
		},
		/**
		* Set/get option
		* @param   {string} name
		* @param   {*}      [value]
		* @returns {*}
		*/
		option: function option(name, value) {
			var options = this.options;
			if (value === void 0) return options[name];
			else {
				var modifiedValue = PluginManager.modifyOption(this, name, value);
				if (typeof modifiedValue !== "undefined") options[name] = modifiedValue;
				else options[name] = value;
				if (name === "group") _prepareGroup(options);
			}
		},
		/**
		* Destroy
		*/
		destroy: function destroy() {
			pluginEvent("destroy", this);
			var el = this.el;
			el[expando] = null;
			off(el, "mousedown", this._onTapStart);
			off(el, "touchstart", this._onTapStart);
			off(el, "pointerdown", this._onTapStart);
			if (this.nativeDraggable) {
				off(el, "dragover", this);
				off(el, "dragenter", this);
			}
			Array.prototype.forEach.call(el.querySelectorAll("[draggable]"), function(el) {
				el.removeAttribute("draggable");
			});
			this._onDrop();
			this._disableDelayedDragEvents();
			sortables.splice(sortables.indexOf(this.el), 1);
			this.el = el = null;
		},
		_hideClone: function _hideClone() {
			if (!cloneHidden) {
				pluginEvent("hideClone", this);
				if (Sortable.eventCanceled) return;
				css(cloneEl, "display", "none");
				if (this.options.removeCloneOnHide && cloneEl.parentNode) cloneEl.parentNode.removeChild(cloneEl);
				cloneHidden = true;
			}
		},
		_showClone: function _showClone(putSortable) {
			if (putSortable.lastPutMode !== "clone") {
				this._hideClone();
				return;
			}
			if (cloneHidden) {
				pluginEvent("showClone", this);
				if (Sortable.eventCanceled) return;
				if (dragEl.parentNode == rootEl && !this.options.group.revertClone) rootEl.insertBefore(cloneEl, dragEl);
				else if (nextEl) rootEl.insertBefore(cloneEl, nextEl);
				else rootEl.appendChild(cloneEl);
				if (this.options.group.revertClone) this.animate(dragEl, cloneEl);
				css(cloneEl, "display", "");
				cloneHidden = false;
			}
		}
	});
	if (documentExists) on(document, "touchmove", function(evt) {
		if ((Sortable.active || awaitingDragStarted) && evt.cancelable) evt.preventDefault();
	});
	Sortable.utils = {
		on,
		off,
		css,
		find,
		is: function is(el, selector) {
			return !!closest(el, selector, el, false);
		},
		extend,
		throttle,
		closest,
		toggleClass,
		clone,
		index,
		nextTick: _nextTick,
		cancelNextTick: _cancelNextTick,
		detectDirection: _detectDirection,
		getChild,
		expando
	};
	/**
	* Get the Sortable instance of an element
	* @param  {HTMLElement} element The element
	* @return {Sortable|undefined}         The instance of Sortable
	*/
	Sortable.get = function(element) {
		return element[expando];
	};
	/**
	* Mount a plugin to Sortable
	* @param  {...SortablePlugin|SortablePlugin[]} plugins       Plugins being mounted
	*/
	Sortable.mount = function() {
		for (var _len = arguments.length, plugins = new Array(_len), _key = 0; _key < _len; _key++) plugins[_key] = arguments[_key];
		if (plugins[0].constructor === Array) plugins = plugins[0];
		plugins.forEach(function(plugin) {
			if (!plugin.prototype || !plugin.prototype.constructor) throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
			if (plugin.utils) Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils);
			PluginManager.mount(plugin);
		});
	};
	/**
	* Create sortable instance
	* @param {HTMLElement}  el
	* @param {Object}      [options]
	*/
	Sortable.create = function(el, options) {
		return new Sortable(el, options);
	};
	Sortable.version = version;
	autoScrolls = [], scrolling = false;
	autoScroll = throttle(function(evt, options, rootEl, isFallback) {
		if (!options.scroll) return;
		var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, sens = options.scrollSensitivity, speed = options.scrollSpeed, winScroller = getWindowScrollingElement();
		var scrollThisInstance = false, scrollCustomFn;
		if (scrollRootEl !== rootEl) {
			scrollRootEl = rootEl;
			clearAutoScrolls();
			scrollEl = options.scroll;
			scrollCustomFn = options.scrollFn;
			if (scrollEl === true) scrollEl = getParentAutoScrollElement(rootEl, true);
		}
		var layersOut = 0;
		var currentParent = scrollEl;
		do {
			var el = currentParent, rect = getRect(el), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, canScrollX = void 0, canScrollY = void 0, scrollWidth = el.scrollWidth, scrollHeight = el.scrollHeight, elCSS = css(el), scrollPosX = el.scrollLeft, scrollPosY = el.scrollTop;
			if (el === winScroller) {
				canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll" || elCSS.overflowX === "visible");
				canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll" || elCSS.overflowY === "visible");
			} else {
				canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll");
				canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll");
			}
			var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
			var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
			if (!autoScrolls[layersOut]) {
				for (var i = 0; i <= layersOut; i++) if (!autoScrolls[i]) autoScrolls[i] = {};
			}
			if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
				autoScrolls[layersOut].el = el;
				autoScrolls[layersOut].vx = vx;
				autoScrolls[layersOut].vy = vy;
				clearInterval(autoScrolls[layersOut].pid);
				if (vx != 0 || vy != 0) {
					scrollThisInstance = true;
					autoScrolls[layersOut].pid = setInterval(function() {
						if (isFallback && this.layer === 0) Sortable.active._onTouchMove(touchEvt$1);
						var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
						var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
						if (typeof scrollCustomFn === "function") {
							if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== "continue") return;
						}
						scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
					}.bind({ layer: layersOut }), 24);
				}
			}
			layersOut++;
		} while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
		scrolling = scrollThisInstance;
	}, 30);
	drop = function drop(_ref) {
		var originalEvent = _ref.originalEvent, putSortable = _ref.putSortable, dragEl = _ref.dragEl, activeSortable = _ref.activeSortable, dispatchSortableEvent = _ref.dispatchSortableEvent, hideGhostForTarget = _ref.hideGhostForTarget, unhideGhostForTarget = _ref.unhideGhostForTarget;
		if (!originalEvent) return;
		var toSortable = putSortable || activeSortable;
		hideGhostForTarget();
		var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
		var target = document.elementFromPoint(touch.clientX, touch.clientY);
		unhideGhostForTarget();
		if (toSortable && !toSortable.el.contains(target)) {
			dispatchSortableEvent("spill");
			this.onSpill({
				dragEl,
				putSortable
			});
		}
	};
	Revert.prototype = {
		startIndex: null,
		dragStart: function dragStart(_ref2) {
			var oldDraggableIndex = _ref2.oldDraggableIndex;
			this.startIndex = oldDraggableIndex;
		},
		onSpill: function onSpill(_ref3) {
			var dragEl = _ref3.dragEl, putSortable = _ref3.putSortable;
			this.sortable.captureAnimationState();
			if (putSortable) putSortable.captureAnimationState();
			var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
			if (nextSibling) this.sortable.el.insertBefore(dragEl, nextSibling);
			else this.sortable.el.appendChild(dragEl);
			this.sortable.animateAll();
			if (putSortable) putSortable.animateAll();
		},
		drop
	};
	_extends(Revert, { pluginName: "revertOnSpill" });
	Remove.prototype = {
		onSpill: function onSpill(_ref4) {
			var dragEl = _ref4.dragEl;
			var parentSortable = _ref4.putSortable || this.sortable;
			parentSortable.captureAnimationState();
			dragEl.parentNode && dragEl.parentNode.removeChild(dragEl);
			parentSortable.animateAll();
		},
		drop
	};
	_extends(Remove, { pluginName: "removeOnSpill" });
	Sortable.mount(new AutoScrollPlugin());
	Sortable.mount(Remove, Revert);
}));
//#endregion
//#region src/lib/js/common/animation.js
var animate;
var init_animation = __esmMin((() => {
	animate = {
		/**
		* Get the computed style for DOM element
		* @param  {Object}  elem     dom element
		* @param  {Boolean} property style eg. width, height, opacity
		* @return {String}           computed style
		*/
		getStyle: (elem, property = false) => {
			let style;
			if (window.getComputedStyle) style = window.getComputedStyle(elem, null);
			else if (elem.currentStyle) style = elem.currentStyle;
			return property ? style[property] : style;
		},
		fadeOut: (elem, duration = 250) => {
			const increment = 1 / (duration / 60);
			elem.style.opacity = 1;
			(function fade() {
				const val = Number(elem.style.opacity) - increment;
				if (val > 0) {
					elem.style.opacity = val;
					window.requestAnimationFrame(fade);
				} else elem.remove();
			})();
		},
		slideDown: (elem, duration = 250, cb = false) => {
			elem.style.display = "block";
			const style = animate.getStyle(elem);
			const height = Number.parseInt(style.height, 10);
			const increment = height / (duration / 60);
			elem.style.height = "0px";
			(function slideDown() {
				const curHeight = Number.parseFloat(elem.style.height);
				const val = curHeight + increment;
				if (curHeight < height) {
					elem.style.height = `${val}px`;
					window.requestAnimationFrame(slideDown);
				} else {
					elem.style.height = "auto";
					if (cb) cb(elem);
				}
			})();
		},
		slideUp: (elem, duration = 250, cb = false) => {
			const style = animate.getStyle(elem);
			const height = Number.parseInt(style.height, 10);
			const overFlowBack = style.overflow;
			elem.style.overflow = "hidden";
			elem.style.height = `${height}px`;
			const defMinHeight = style.minHeight;
			elem.style.minHeight = "auto";
			const increment = parseFloat(height / (duration / 60)).toFixed(2);
			(function slideUp() {
				const val = Number.parseInt(elem.style.height, 10) - increment;
				if (val > 0) {
					elem.style.height = `${val}px`;
					window.requestAnimationFrame(slideUp);
				} else {
					elem.style.overflow = overFlowBack;
					elem.style.display = "none";
					elem.style.minHeight = defMinHeight;
					delete elem.style.height;
					if (cb) cb(elem);
				}
			})();
		},
		slideToggle: (elem, duration = 250, open = animate.getStyle(elem, "display") === "none") => {
			if (open) animate.slideDown(elem, duration);
			else animate.slideUp(elem, duration);
		}
	};
}));
//#endregion
//#region src/lib/js/common/helpers.mjs
var isInt, indexOfNode, orderObjectsBy, forEach, map, sanitizedAttributeNames, safeAttrName, capitalize, copyObj, subtract, helpers;
var init_helpers$2 = __esmMin((() => {
	init_utils();
	init_object();
	isInt = (n) => Number.isInteger(Number(n));
	indexOfNode = (node) => {
		let index = 0;
		let currentNode = node;
		while (currentNode?.previousElementSibling) {
			currentNode = currentNode.previousElementSibling;
			index++;
		}
		return index;
	};
	orderObjectsBy = (elements, order, path) => {
		const splitPath = path.split("||");
		return unique(unique(order).map((key) => elements.find((elem) => {
			const newPath = splitPath.find((p) => !!get(elem, p));
			return newPath && get(elem, newPath) === key;
		})).filter(Boolean).concat(elements));
	};
	forEach = (arr, cb, scope) => {
		for (let i = 0; i < arr.length; i++) cb.call(scope, arr[i], i);
	};
	map = (arr, cb) => {
		const newArray = [];
		forEach(arr, (elem, i) => newArray.push(cb(elem, i)));
		return newArray;
	};
	sanitizedAttributeNames = {};
	safeAttrName = (name) => {
		const attributeMap = { className: "class" };
		if (sanitizedAttributeNames[name]) return sanitizedAttributeNames[name];
		const sanitizedAttributeName = (attributeMap[name] || name).replace(/^\d+/, "").replace(/[^a-zA-Z0-9-:]/g, "");
		sanitizedAttributeNames[name] = sanitizedAttributeName;
		return sanitizedAttributeName;
	};
	capitalize = (str) => str.replace(/\b\w/g, (m) => m.toUpperCase());
	copyObj = (obj) => window.JSON.parse(window.JSON.stringify(obj));
	subtract = (arr, from) => from.filter((a) => !~arr.indexOf(a));
	helpers = {
		capitalize,
		safeAttrName,
		forEach,
		copyObj,
		map,
		subtract,
		indexOfNode,
		isInt,
		get,
		orderObjectsBy
	};
}));
//#endregion
//#region src/lib/js/common/loaders.js
var loaded, AJAX_TIMEOUT_MS, ajax, onLoadStylesheet, onLoadJavascript, insertScript, insertStyle, insertScripts, insertStyles, insertIcons, fetchIcons, LOADER_MAP, fetchDependencies, fetchFormeoStyle;
var init_loaders = __esmMin((() => {
	init_constants();
	init_dom();
	init_utils();
	loaded = {
		js: /* @__PURE__ */ new Set(),
		css: /* @__PURE__ */ new Set(),
		formeoSprite: null
	};
	AJAX_TIMEOUT_MS = 1e4;
	ajax = (fileUrl, callback, onError = noop, timeoutMs = AJAX_TIMEOUT_MS) => {
		return new Promise((resolve) => {
			const signal = typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : void 0;
			return fetch(fileUrl, signal ? { signal } : void 0).then((data) => {
				if (!data.ok) return resolve(onError(data));
				resolve(callback ? callback(data) : data);
			}).catch((err) => resolve(onError(err)));
		});
	};
	onLoadStylesheet = (elem, cb) => {
		elem.removeEventListener("load", onLoadStylesheet);
		cb(elem.src);
	};
	onLoadJavascript = (elem, cb) => {
		elem.removeEventListener("load", onLoadJavascript);
		cb(elem.src);
	};
	insertScript = (src) => {
		return new Promise((resolve, reject) => {
			if (loaded.js.has(src)) return resolve(src);
			loaded.js.add(src);
			const script = dom.create({
				tag: "script",
				attrs: {
					type: "text/javascript",
					async: true,
					src
				},
				action: {
					load: () => onLoadJavascript(script, resolve),
					error: () => reject(/* @__PURE__ */ new Error(`${src} failed to load.`))
				}
			});
			document.head.appendChild(script);
		});
	};
	insertStyle = (srcs) => {
		srcs = Array.isArray(srcs) ? srcs : [srcs];
		const promises = srcs.map((src) => new Promise((resolve, reject) => {
			if (loaded.css.has(src)) return resolve(src);
			loaded.css.add(src);
			const styleLink = dom.create({
				tag: "link",
				attrs: {
					rel: "stylesheet",
					href: src
				},
				action: {
					load: () => onLoadStylesheet(styleLink, resolve),
					error: () => reject(/* @__PURE__ */ new Error(`${src} failed to load.`))
				}
			});
			document.head.appendChild(styleLink);
		}));
		return Promise.all(promises);
	};
	insertScripts = (srcs) => {
		srcs = Array.isArray(srcs) ? srcs : [srcs];
		const promises = srcs.map((src) => insertScript(src));
		return Promise.all(promises);
	};
	insertStyles = (srcs) => {
		srcs = Array.isArray(srcs) ? srcs : [srcs];
		const promises = srcs.map((src) => insertStyle(src));
		return Promise.all(promises);
	};
	insertIcons = (iconSvgStr) => {
		loaded.formeoSprite = new DOMParser().parseFromString(iconSvgStr, "image/svg+xml").documentElement;
		return loaded.formeoSprite;
	};
	fetchIcons = async (iconSpriteUrl = null) => {
		if (loaded.formeoSprite) return loaded.formeoSprite;
		if (!iconSpriteUrl) return insertIcons(formeo_sprite_default);
		const parseResp = async (resp) => insertIcons(await resp.text());
		return ajax(iconSpriteUrl, parseResp, () => ajax(FALLBACK_SVG_SPRITE_URL, parseResp));
	};
	LOADER_MAP = {
		js: insertScripts,
		css: insertStyles
	};
	fetchDependencies = (dependencies) => {
		const promises = Object.entries(dependencies).map(([type, src]) => {
			return LOADER_MAP[type](src);
		});
		return Promise.all(promises);
	};
	fetchFormeoStyle = async (cssUrl) => {
		if (cssUrl && !loaded.css.has(cssUrl)) {
			await insertStyle(cssUrl);
			if (!loaded.css.has(cssUrl) && !loaded.css.has("https://draggable.github.io/formeo/assets/css/formeo.min.css")) return await insertStyle(FALLBACK_CSS_URL);
		}
	};
}));
//#endregion
//#region src/lib/js/common/dom.js
var iconFontTemplates, inputTags, stripOn, useCaptureEvts, defaultActionHandler, getName, DOM, dom;
var init_dom = __esmMin((() => {
	init_components();
	init_constants();
	init_animation();
	init_helpers$2();
	init_loaders();
	init_utils();
	init_string();
	iconFontTemplates = {
		glyphicons: (icon) => `<span class="glyphicon glyphicon-${icon}" aria-hidden="true"></span>`,
		"font-awesome": (icon) => {
			const [style, name] = icon.split(" ");
			return `<i class="${style} fa-${name}"></i>`;
		},
		fontello: (icon) => `<i class="${iconPrefix}${icon}">${icon}</i>`
	};
	inputTags = new Set([
		"input",
		"textarea",
		"select"
	]);
	stripOn = (str) => str.replace(/^on([A-Z])/, (_, l) => l.toLowerCase());
	useCaptureEvts = new Set(["focus", "blur"]);
	defaultActionHandler = (event) => {
		const eventName = stripOn(event);
		return (node, cb) => node.addEventListener(eventName, cb, useCaptureEvts.has(eventName));
	};
	getName = (elem = {}) => {
		let name = elem?.attrs?.name || elem?.name;
		if (name) return name;
		const id = uuid(elem);
		let label = elem.config?.label || elem.attrs?.label || elem?.label;
		if (label) {
			if (typeof label === "object") label = dom.create(label).textContent;
			if (/^<.+>.+<.+>$/gim.test(label)) label = extractTextFromHtml(label);
			name = `${id}-${slugify(truncateByWord(label, 24, null))}`;
		}
		return name || id;
	};
	DOM = class {
		/**
		* Set defaults, store references to key elements
		* like stages, rows, columns etc
		*/
		constructor(options = Object.create(null)) {
			this.options = options;
		}
		set setOptions(options) {
			this.options = merge(this.options, options);
		}
		/**
		* Ensure elements have proper tagName
		* @param  {Object|String} elem
		* @return {Object} valid element object
		*/
		processElemArg(elemArg) {
			let elem = elemArg;
			let tagName;
			if (typeof elem === "string") {
				tagName = elem;
				elem = { tag: tagName };
				return elem;
			}
			if (elem.attrs) {
				const { tag, ...restAttrs } = elem.attrs;
				if (tag) if (typeof tag === "string") tagName = tag;
				else tagName = (tag.find((t) => t.selected === true) || tag[0]).value;
				elem.attrs = restAttrs;
			}
			elem.tag = tagName || elem.tag || "div";
			return elem;
		}
		/**
		* Wraps dom.create to modify data
		* Used when rendering components in form- not editor
		*/
		render = (elem) => {
			elem.id = `f-${elem.id || uuid()}`;
			return this.create(elem);
		};
		/**
		* Creates DOM elements
		* @param  {Object}  elem      element config object
		* @param  {Boolean} isPreview generating element for preview or render?
		* @return {Object}            DOM Object
		*/
		create = (elemArg, isPreview = false) => {
			if (!elemArg) return;
			if (this.isDOMElement(elemArg)) return elemArg;
			const _this = this;
			const processed = ["children", "content"];
			const { className, options, dataset, ...elem } = this.processElemArg(elemArg);
			processed.push("tag");
			let childType;
			const { tag } = elem;
			let i;
			const wrap = {
				attrs: {},
				className: [helpers.get(elem, "config.inputWrap")],
				children: [],
				config: {}
			};
			let element = document.createElement(tag);
			/**
			* Object for mapping contentType to its function
			* @type {Object}
			*/
			const appendChildren = {
				string: (children) => {
					element.innerHTML += children;
				},
				object: (children) => {
					return children && element.appendChild(_this.create(children, isPreview));
				},
				node: (children) => {
					return element.appendChild(children);
				},
				component: (children) => {
					return element.appendChild(children.dom);
				},
				array: (children) => {
					for (const child of children) {
						childType = _this.childType(child);
						appendChildren[childType](child);
					}
				},
				function: (children) => {
					children = children();
					childType = _this.childType(children);
					appendChildren[childType](children);
				},
				undefined: () => null,
				boolean: () => null
			};
			if (className) elem.attrs = merge(elem.attrs, { className });
			if (options) {
				const processedOptions = this.processOptions(options, elem, isPreview);
				if (this.holdsContent(element) && tag !== "button") {
					appendChildren.array.call(this, processedOptions);
					elem.content = void 0;
				} else {
					helpers.forEach(processedOptions, (option) => {
						wrap.children.push(_this.create(option, isPreview));
					});
					if (elem.attrs.className) wrap.className = elem.attrs.className;
					wrap.id = elem.id;
					wrap.config = { ...elem.config };
					return this.create(wrap, isPreview);
				}
				processed.push("options");
			}
			if (elem.attrs) {
				_this.processAttrs(elem, element, isPreview);
				processed.push("attrs");
			}
			if (elem.config) {
				if (elem.config.label && (elem.config.label && tag !== "button" || ["radio", "checkbox"].includes(helpers.get(elem, "attrs.type"))) && !isPreview) {
					const label = _this.label(elem);
					if (!elem.config.hideLabel) {
						const wrapContent = [label, element];
						if (_this.labelAfter(elem)) wrapContent.reverse();
						wrap.children.push(wrapContent);
					}
				}
				processed.push("config");
			}
			if (elem.content || elem.children) {
				const children = elem.content || elem.children;
				childType = _this.childType(children);
				if (!appendChildren[childType]) console.error(`childType: ${childType} is not supported`);
				appendChildren[childType].call(this, children);
			}
			if (dataset) {
				for (const data in dataset) if (Object.hasOwn(dataset, data)) element.dataset[data] = typeof dataset[data] === "function" ? dataset[data]() : dataset[data];
				processed.push("dataset");
			}
			if (elem.action) {
				this.actionHandler(element, elem.action);
				processed.push("action");
			}
			const remaining = helpers.subtract(processed, Object.keys(elem));
			for (i = remaining.length - 1; i >= 0; i--) element[remaining[i]] = elem[remaining[i]];
			if (wrap.children.length) element = this.create(wrap);
			return element;
		};
		onRender = (node, cb, timeout = 333) => {
			const start = Date.now();
			const checkParent = () => {
				if (!node.parentElement && Date.now() - start < timeout) window.requestAnimationFrame(checkParent);
				else if (node.parentElement) cb(node);
			};
			checkParent();
		};
		/**
		* Processes element config object actions (click, onRender etc)
		*/
		actionHandler(node, actions) {
			const handlers = {
				onRender: dom.onRender,
				render: dom.onRender
			};
			return Object.entries(actions).map(([event, cb]) => {
				return (Array.isArray(cb) ? cb : [cb]).map((cb) => {
					return (handlers[event] || defaultActionHandler(event))(node, cb);
				});
			});
		}
		get icons() {
			if (this.iconSymbols) return this.iconSymbols;
			const iconSymbolNodes = loaded.formeoSprite.querySelectorAll("svg symbol");
			/**
			* Creates an SVG icon config by inlining the symbol's content
			* This allows icons to work without the sprite being in the DOM
			*/
			const createSvgIconConfig = (symbol) => {
				const viewBox = symbol.getAttribute("viewBox") || "0 0 24 24";
				const children = Array.from(symbol.children).map((child) => {
					return child.cloneNode(true).outerHTML;
				}).join("");
				return {
					tag: "svg",
					attrs: {
						className: ["svg-icon", symbol.id],
						viewBox,
						xmlns: "http://www.w3.org/2000/svg"
					},
					children
				};
			};
			this.iconSymbols = Array.from(iconSymbolNodes).reduce((acc, symbol) => {
				const name = symbol.id.replace(iconPrefix, "");
				acc[name] = createSvgIconConfig(symbol);
				return acc;
			}, {});
			this.cachedIcons = {};
			return this.iconSymbols;
		}
		/**
		* Create and SVG or font icon.
		* Simple string concatenation instead of DOM.create because:
		*  - we don't need the perks of having icons be DOM objects at this stage
		*  - it forces the icon to be appended using innerHTML which helps svg render
		* @param  {String} name - icon name
		* @param  {Function} config - dom element config object
		* @return {String} icon markup
		*/
		icon(name, config) {
			if (!name) return;
			const cacheKey = `${name}?${new URLSearchParams(config).toString()}`;
			if (this.cachedIcons?.[cacheKey]) return this.cachedIcons[cacheKey];
			const iconConfig = this.icons[name];
			if (iconConfig) {
				if (config) {
					const mergedConfig = merge(iconConfig, config);
					this.cachedIcons[cacheKey] = dom.create(mergedConfig).outerHTML;
					return this.cachedIcons[cacheKey];
				}
				this.cachedIcons[cacheKey] = dom.create(iconConfig).outerHTML;
				return this.cachedIcons[cacheKey];
			}
			return iconFontTemplates[dom.options.iconFont]?.(name) || name;
		}
		/**
		* JS Object to DOM attributes
		* @param  {Object} elem    element config object
		* @param  {Object} element DOM element we are building
		* @param  {Boolean} isPreview
		* @return {void}
		*/
		processAttrs(elem, element, isPreview) {
			const { attrs = {} } = elem;
			if (!isPreview && !attrs.name && attrs.name !== null && this.isInput(elem.tag)) {
				const name = getName(elem);
				if (name) element.setAttribute("name", name);
			}
			for (const attr of Object.keys(attrs)) {
				const safeAttrName = helpers.safeAttrName(attr);
				const value = this.processAttrValue(attrs[attr]);
				if (value !== false) try {
					element.setAttribute(safeAttrName, value);
				} catch (e) {
					console.warn(`Could not set attribute ${safeAttrName} with value ${value}`, e);
				}
			}
		}
		processAttrValue(valueArg) {
			if (typeof valueArg === "function") return valueArg();
			if (typeof valueArg === "boolean") {
				if (valueArg) return "";
				return valueArg;
			}
			let value = valueArg || "";
			if (Array.isArray(value)) if (typeof value[0] === "object") {
				const selected = value.filter((t) => t.selected === true);
				value = selected.length ? selected[0].value : value[0].value;
			} else value = value.join(" ");
			return value;
		}
		/**
		* Hide or show an Array or HTMLCollection of elements
		* @param  {Array} elems
		* @param  {String} term  match textContent to this term
		* @return {Array}        filtered elements
		*/
		toggleElementsByStr = (elems, term) => {
			const filteredElems = [];
			const containsTextCb = (elem, contains) => {
				if (contains) {
					elem.style.display = "block";
					filteredElems.push(elem);
				} else elem.style.display = "none";
			};
			dom.elementsContainText(elems, term, containsTextCb);
			return filteredElems;
		};
		elementsContainText = (collection, term, cb) => {
			const elementsContainingText = [];
			forEach(collection, (elem) => {
				const contains = elem.textContent.toLowerCase().indexOf(term.toLowerCase()) !== -1;
				cb?.(elem, contains);
				contains && elementsContainingText.push(elem);
			});
			return elementsContainingText;
		};
		generateOption = ({ type = "option", label, value, i = 0, selected }) => {
			return {
				tag: type === "option" ? "option" : "input",
				attrs: {
					type,
					value: value || `${type}-${i}`,
					[type === "option" ? "selected" : "checked"]: selected || !i
				},
				config: { label: label || s.get("labelCount", {
					label: s.get("option"),
					count: i
				}) }
			};
		};
		/**
		* Extend Array of option config objects
		* @param  {Array} options
		* @param  {Object} elem element config object
		* @param  {Boolean} isPreview
		* @return {Array} option config objects
		*/
		processOptions(options, elem, isPreview) {
			const { action, attrs = {} } = elem;
			const fieldType = attrs.type || elem.tag;
			const id = attrs.id || elem.id;
			const optionMap = (option, i) => {
				const { label, value, ...rest } = option;
				const defaultInput = () => {
					const input = {
						tag: "input",
						attrs: {
							name: id,
							type: fieldType,
							value: value || "",
							id: `${id}-${i}`,
							...rest
						},
						action
					};
					const optionLabel = {
						tag: "label",
						attrs: { for: `${id}-${i}` },
						children: label
					};
					const inputWrap = {
						children: [input, optionLabel],
						className: [`f-${fieldType}`]
					};
					if (attrs.className) elem.config.inputWrap = attrs.className;
					if (elem.config.inline) inputWrap.className.push(`f-${fieldType}-inline`);
					if (option.selected) input.attrs.checked = true;
					if (isPreview) optionLabel.attrs.contenteditable = true;
					return inputWrap;
				};
				return {
					select: () => {
						const defaultAttrs = option.attrs || option;
						const { label, checked, selected, attrs } = {
							attrs: defaultAttrs,
							...option,
							...defaultAttrs
						};
						return {
							tag: "option",
							attrs: {
								...attrs,
								selected: !!(checked || selected)
							},
							children: label
						};
					},
					button: (option) => {
						const { type, label, className, id } = option;
						return {
							...elem,
							attrs: { type },
							className,
							id: id || uuid(),
							options: void 0,
							children: label,
							action: elem.action
						};
					},
					checkbox: defaultInput,
					radio: defaultInput
				}[fieldType]?.(option);
			};
			return options.map(optionMap);
		}
		/**
		* Checks if there is a closing tag, if so it can hold content
		* @param  {Object} element DOM element
		* @return {Boolean} holdsContent
		*/
		holdsContent(element) {
			return element.outerHTML.includes("/");
		}
		/**
		* Is this a textarea, select or other block input
		* also isContentEditable
		* @param  {Object}  element
		* @return {Boolean}
		*/
		isBlockInput(element) {
			return !this.isInput(element) && this.holdsContent(element);
		}
		/**
		* Determine if an element is an input field
		* @param  {String|Object} tag tagName or DOM element
		* @return {Boolean} isInput
		*/
		isInput(tagArg) {
			let tag = tagArg;
			if (typeof tag !== "string") tag = tag.tagName;
			return inputTags.has(tag);
		}
		/**
		* Converts escaped HTML into usable HTML
		* @param  {String} html escaped HTML
		* @return {String}      parsed HTML
		*/
		parsedHtml(html) {
			const escapeElement = document.createElement("textarea");
			escapeElement.innerHTML = html;
			return escapeElement.textContent;
		}
		/**
		* Test if label should be display before or after an element
		* @param  {Object} elem config
		* @return {Boolean} labelAfter
		*/
		labelAfter(elem) {
			const type = helpers.get(elem, "attrs.type");
			const labelAfter = helpers.get(elem, "config.labelAfter");
			return labelAfter === void 0 ? type === "checkbox" || type === "radio" : labelAfter;
		}
		requiredMark = () => ({
			tag: "span",
			className: "text-error",
			children: "*"
		});
		tooltip = (tooltip) => ({
			tag: "span",
			className: "f-tooltip",
			dataset: { tooltip },
			content: dom.icon("info-circle")
		});
		helpText = (helpText) => ({
			tag: "small",
			className: "f-help-text",
			children: helpText
		});
		/**
		* Generate a label
		* @param  {Object} elem config object
		* @param  {String} fMap map to label's value in formData
		* @return {Object}      config object
		*/
		label(elem, fMap) {
			const required = helpers.get(elem, "attrs.required");
			let { config: { label: labelText = "", helpText = "", tooltip = null } } = elem;
			const { id: elemId, attrs } = elem;
			if (typeof labelText === "function") labelText = labelText();
			const fieldLabel = {
				tag: "label",
				attrs: { for: elemId || attrs?.id },
				className: [],
				children: [
					labelText,
					required && this.requiredMark(),
					tooltip && this.tooltip(tooltip),
					helpText && this.helpText(helpText)
				],
				action: {}
			};
			if (fMap) {
				fieldLabel.attrs.for = void 0;
				fieldLabel.attrs.contenteditable = true;
				fieldLabel.fMap = fMap;
			}
			return fieldLabel;
		}
		/**
		* Determine content type
		* @param  {Node | String | Array | Object} content
		* @return {String}
		*/
		childType(content) {
			if (content === void 0) return content;
			return [
				["array", (content) => Array.isArray(content)],
				["node", (content) => content instanceof window.Node || content instanceof window.HTMLElement],
				["component", () => content?.dom],
				[typeof content, () => true]
			].find((typeCondition) => typeCondition[1](content))[0];
		}
		/**
		* Get the computed style for DOM element
		* @param  {Object}  elem     dom element
		* @param  {Boolean} property style eg. width, height, opacity
		* @return {String}           computed style
		*/
		getStyle(elem, property = false) {
			let style;
			if (window.getComputedStyle) style = window.getComputedStyle(elem, null);
			else if (elem.currentStyle) style = elem.currentStyle;
			return property ? style[property] : style;
		}
		/**
		* Retrieves an element by config object, string id,
		* or existing reference
		* @param  {Object|String|Node} elem
		* @return {Object}             DOM element
		*/
		getElement(elem) {
			return {
				node: () => elem,
				object: () => document.getElementById(elem.id),
				string: () => document.getElementById(elem)
			}[this.childType(elem)]();
		}
		/**
		* Util to remove contents of DOM Object
		* @param  {Object} elem
		* @return {Object} element with its children removed
		*/
		empty(elem) {
			while (elem.firstChild) this.remove(elem.firstChild);
			return elem;
		}
		/**
		* Remove elements without f children
		* @param  {Object} element DOM element
		* @return {Object} formData
		*/
		removeEmpty = (element) => {
			const parent = element.parentElement;
			const type = componentType(element);
			const children = parent.getElementsByClassName(`formeo-${type}`);
			this.remove(element);
			if (!children.length) {
				if (!this.isStage(parent)) return this.removeEmpty(parent);
				return this.emptyClass(parent);
			}
		};
		/**
		* Removes element from DOM and data
		* @param  {Object} elem
		* @return  {Object} parent element
		*/
		remove(elem) {
			const type = componentType(elem);
			if (type) return components.remove(`${type}s.${elem.id}`);
			return elem.parentElement.removeChild(elem);
		}
		/**
		* Removes a class or classes from nodeList
		*
		* @param  {NodeList|Node} nodeList
		* @param  {String | Array} className
		*/
		removeClasses(nodeList, className) {
			const removeClass = {
				string: (elem) => elem.classList.remove(className),
				array: (elem) => {
					for (const name of className) elem.classList.remove(name);
				}
			};
			removeClass.object = removeClass.string;
			helpers.forEach(nodeList, removeClass[this.childType(className)]);
		}
		/**
		* Adds a class or classes from nodeList
		*
		* @param  {NodeList} nodeList
		* @param  {String | Array} className
		*/
		addClasses(nodeList, className) {
			helpers.forEach(nodeList, {
				string: (elem) => elem.classList.add(className),
				array: (elem) => {
					for (const name of className) elem.classList.add(name);
				}
			}[this.childType(className)]);
		}
		/**
		* Wrap content in a formGroup
		* @param  {Object|Array|String} content
		* @param  {String} className
		* @return {Object} formGroup config
		*/
		formGroup(content, className = "") {
			return {
				className: ["f-field-group", className],
				children: content
			};
		}
		/**
		* Returns the {x, y} coordinates for the
		* center of a given element
		* @param  {DOM} element
		* @return {Object}      {x,y} coordinates
		*/
		coords(element) {
			const elemPosition = element.getBoundingClientRect();
			const bodyRect = document.body.getBoundingClientRect();
			return {
				pageX: elemPosition.left + elemPosition.width / 2,
				pageY: elemPosition.top - bodyRect.top - elemPosition.height / 2
			};
		}
		/**
		* Removes all fields and resets a stage
		* @param  {DOM} stage DOM element
		*/
		clearStage(stage) {
			stage.classList.add("removing-all-fields");
			const resetStage = () => {
				dom.empty(stage);
				stage.classList.remove("removing-all-fields");
				dom.emptyClass(stage);
				animate.slideDown(stage, 300);
			};
			animate.slideUp(stage, 600, resetStage);
		}
		/**
		* Toggles a sortables `disabled` option.
		* @param  {Object} elem DOM element
		* @param  {Boolean} state
		*/
		toggleSortable(elem, stateArg) {
			let state = stateArg;
			const fType = componentType(elem);
			if (!fType) return;
			const pFtype = componentType(elem.parentElement);
			const sortable = dom[fType].get(elem.id).sortable;
			if (!state) state = !sortable.option("disabled");
			sortable.option("disabled", state);
			if (pFtype && [
				"rows",
				"columns",
				"stages"
			].includes(pFtype)) this.toggleSortable(elem.parentElement, state);
		}
		/**
		* Apply empty class to element if does not have children
		* @param  {Object} elem
		*/
		emptyClass(elem) {
			const children = elem.getElementsByClassName(CHILD_CLASSNAME_MAP.get(elem.classList.item(0)));
			elem.classList.toggle("empty", !children.length);
		}
		btnTemplate = ({ title = "", ...rest }) => ({
			tag: "button",
			attrs: {
				type: "button",
				title
			},
			...rest
		});
		isControls = (node) => componentType(node) === CONTROL_GROUP_CLASSNAME;
		isStage = (node) => componentType(node) === STAGE_CLASSNAME;
		isRow = (node) => componentType(node) === ROW_CLASSNAME;
		isColumn = (node) => componentType(node) === COLUMN_CLASSNAME;
		isField = (node) => componentType(node) === FIELD_CLASSNAME;
		asComponent = (elem) => components[`${componentType(elem)}s`].get(elem.id);
		isDOMElement(variable) {
			return variable instanceof window.Element || variable instanceof window.HTMLElement || !!(variable && typeof variable === "object" && variable.nodeType === 1 && typeof variable.nodeName === "string");
		}
		resolveContainer(container) {
			return typeof container === "string" ? document.querySelector(container) : container;
		}
	};
	dom = new DOM();
}));
//#endregion
//#region src/lib/js/components/autocomplete/helpers.mjs
var BASE_NAME, DISPLAY_FIELD_CLASSNAME, LIST_CLASSNAME, HIGHLIGHT_CLASSNAME, LIST_ITEM_CLASSNAME, labelCount, fieldLabelPaths, rowLabelPaths, componentLabelPaths, resolveFieldLabel, resolveComponentLabel, labelResolverMap, getComponentLabel, makeOptionData, realTarget, makeListItem, makeComponentOptionsList, componentOptions;
var init_helpers$1 = __esmMin((() => {
	init_dom();
	init_string();
	init_components();
	BASE_NAME = "f-autocomplete";
	DISPLAY_FIELD_CLASSNAME = `${BASE_NAME}-display-field`;
	LIST_CLASSNAME = `${BASE_NAME}-list`;
	HIGHLIGHT_CLASSNAME = "highlight-component";
	LIST_ITEM_CLASSNAME = `${LIST_CLASSNAME}-item`;
	labelCount = (arr, label) => {
		const count = arr.reduce((n, x) => n + (x === label), 0);
		return count > 1 ? `(${count})` : "";
	};
	fieldLabelPaths = ["config.label", "config.controlId"];
	rowLabelPaths = ["config.legend", "name"];
	componentLabelPaths = [...fieldLabelPaths, ...rowLabelPaths];
	resolveFieldLabel = (field) => {
		return fieldLabelPaths.reduce((acc, path) => {
			if (!acc) return field.get(path);
			return acc;
		}, null);
	};
	resolveComponentLabel = (component) => {
		return componentLabelPaths.reduce((acc, path) => {
			if (!acc) return component.get(path);
			return acc;
		}, null) || toTitleCase(component.name);
	};
	labelResolverMap = new Map([
		["condition.source", resolveFieldLabel],
		["if.condition.source", resolveFieldLabel],
		["if.condition.target", resolveFieldLabel],
		["then.condition.target", resolveComponentLabel],
		["condition.target", resolveComponentLabel]
	]);
	getComponentLabel = ({ id, ...component }, key) => {
		const { name, label } = component;
		if (!name) return label;
		return labelResolverMap.get(key)(component);
	};
	makeOptionData = ({ selectedId, ...option }) => {
		if (option.value === selectedId) option.selected = true;
		return option;
	};
	realTarget = (target) => {
		if (!target.classList.contains(LIST_ITEM_CLASSNAME)) target = target.parentElement;
		return target;
	};
	makeListItem = ({ value, textLabel, htmlLabel, componentType, depth = 0 }, autocomplete) => {
		const optionConfig = {
			tag: "li",
			children: htmlLabel,
			dataset: {
				value,
				label: textLabel
			},
			className: [
				LIST_ITEM_CLASSNAME,
				`${LIST_ITEM_CLASSNAME}-depth-${depth}`,
				`component-type-${componentType}`
			],
			action: {
				mousedown: ({ target }) => {
					target = realTarget(target);
					autocomplete.setValue(target);
					autocomplete.selectOption(target);
					autocomplete.hideList();
				},
				mouseover: ({ target }) => {
					target = realTarget(target);
					autocomplete.removeHighlight();
					autocomplete.highlightComponent(target);
				},
				mouseleave: ({ target }) => {
					target = realTarget(target);
					autocomplete.removeHighlight();
				}
			}
		};
		return dom.create(optionConfig);
	};
	makeComponentOptionsList = (component, autocomplete) => {
		const items = component.data.options.map((option, index) => {
			const value = `${component.address}.options[${index}]`;
			const textLabel = option.label;
			const htmlLabel = option.label;
			return makeListItem({
				value,
				textLabel,
				htmlLabel,
				componentType: "option",
				depth: 1
			}, autocomplete);
		});
		return dom.create({
			tag: "ul",
			attrs: { className: [LIST_CLASSNAME, "options-list"] },
			children: items
		});
	};
	componentOptions = (autocomplete) => {
		const selectedId = autocomplete.value;
		const labels = [];
		const flatList = components.flatList();
		return Object.entries(flatList).reduce((acc, [value, component]) => {
			const label = getComponentLabel(component, autocomplete.key);
			if (label) {
				const componentType = component.name;
				const typeConfig = {
					tag: "span",
					content: ` ${toTitleCase(componentType)}`,
					className: "component-type"
				};
				const labelKey = `${componentType}.${label}`;
				labels.push(labelKey);
				const count = labelCount(labels, labelKey);
				const countConfig = {
					tag: "span",
					content: count,
					className: "component-label-count"
				};
				const htmlLabel = [
					`${label} `,
					countConfig,
					typeConfig
				];
				const textLabel = [label, count].join(" ").trim();
				if (component.isCheckable) {
					const componentOptionsList = makeComponentOptionsList(component, autocomplete);
					htmlLabel.push(componentOptionsList);
				}
				const optionData = makeOptionData({
					value,
					textLabel,
					htmlLabel,
					componentType,
					selectedId
				});
				acc.push(makeListItem(optionData, autocomplete));
			}
			return acc;
		}, []);
	};
}));
//#endregion
//#region src/lib/js/components/autocomplete/autocomplete.mjs
var Autocomplete;
var init_autocomplete = __esmMin((() => {
	init_i18n_es_min();
	init_animation();
	init_dom();
	init_utils();
	init_string();
	init_constants();
	init_components();
	init_helpers$1();
	Autocomplete = class {
		lastCache = Date.now();
		optionsCache = null;
		/**
		* Create an Autocomplete instance
		* @param {String} key - The key for the autocomplete instance
		* @param {String} value - The initial value for the autocomplete input
		*/
		constructor({ key, value, className, onChange = noop }) {
			this.key = key;
			this.className = [className || this.key.replace(/\./g, "-")].flat();
			this.value = value;
			this.onChange = onChange || noop;
			this.events = [];
			this.build();
		}
		createProxy() {
			return new Proxy(this, {
				get(target, prop) {
					if (prop in target) return target[prop];
					if (prop in target.dom) {
						const value = target.dom[prop];
						return typeof value === "function" ? value.bind(target.dom) : value;
					}
				},
				set(target, prop, value) {
					if (prop in target) target[prop] = value;
					else target.dom[prop] = value;
					return true;
				}
			});
		}
		get isAddress() {
			return isAddress(this.value);
		}
		get valueComponent() {
			return isAddress(this.value) && components.getAddress(this.value);
		}
		/**
		* build a text DOM element, supporting other jquery text form-control's
		* @return {Object} DOM Element to be injected into the form.
		*/
		build() {
			const keyboardNav = (e) => {
				const list = this.list;
				const activeOption = this.getActiveOption();
				let direction = new Map([
					[38, () => {
						const previous = this.getPreviousOption(activeOption);
						if (previous) this.selectOption(previous);
					}],
					[40, () => {
						const next = this.getNextOption(activeOption);
						if (next) this.selectOption(next);
					}],
					[13, () => {
						if (activeOption) {
							this.selectOption(activeOption);
							this.setValue(activeOption);
							if (list.style.display === "none") this.showList(activeOption);
							else this.hideList();
						}
						e.preventDefault();
					}],
					[27, () => {
						this.hideList();
					}]
				]).get(e.keyCode);
				if (!direction) direction = () => false;
				return direction();
			};
			const autoCompleteInputActions = {
				focus: ({ target }) => {
					this.updateOptions();
					target.parentElement.classList.add(`${BASE_NAME}-focused`);
					const filteredOptions = dom.toggleElementsByStr(this.list.querySelectorAll(`.${LIST_ITEM_CLASSNAME}-depth-0`), target.value);
					target.addEventListener("keydown", keyboardNav);
					const selectedOption = this.list.querySelector(".active-option") || filteredOptions[0];
					this.showList(selectedOption);
				},
				blur: ({ target }) => {
					target.parentElement.classList.remove(`${BASE_NAME}-focused`);
					target.removeEventListener("keydown", keyboardNav);
					this.hideList();
				},
				input: (evt) => {
					const { value } = evt.target;
					const filteredOptions = dom.toggleElementsByStr(this.list.querySelectorAll("li"), value);
					if (value.length === 0) this.clearValue();
					if (filteredOptions.length === 0) this.hideList();
					else {
						const activeOption = this.getActiveOption() || filteredOptions[0];
						this.showList(activeOption);
					}
					this.setValue({ dataset: {
						label: value,
						value
					} });
				}
			};
			this.displayField = dom.create({
				tag: "input",
				autocomplete: "off",
				action: autoCompleteInputActions,
				attrs: {
					type: "text",
					className: DISPLAY_FIELD_CLASSNAME,
					value: this.label || this.value,
					placeholder: s.get(`${this.key}.placeholder`)
				}
			});
			this.hiddenField = dom.create({
				tag: "input",
				attrs: {
					type: "hidden",
					className: BASE_NAME,
					value: this.value
				}
			});
			this.list = dom.create({
				tag: "ul",
				attrs: { className: LIST_CLASSNAME }
			});
			this.clearButton = dom.create({
				tag: "span",
				content: dom.icon("remove"),
				className: "clear-button hidden",
				action: { click: () => this.clearValue() }
			});
			this.dom = dom.create({
				children: [
					this.displayField,
					this.clearButton,
					this.hiddenField
				],
				className: [BASE_NAME, this.className].flat(),
				action: { onRender: (element) => {
					this.stage = element.closest(".formeo-stage");
					if (this.value) this.displayField.value = this.label;
					this.clearButton.classList.toggle("hidden", !this.value.length);
				} }
			});
			return this.dom;
		}
		get label() {
			if (!isAddress(this.value)) return this.value;
			const component = this.value && components.getAddress(this.value);
			return component && getComponentLabel(component, `${this.key}`) || this.value;
		}
		updateOptions() {
			let options = this.optionsCache;
			const now = Date.now();
			if (now - this.lastCache > ANIMATION_SPEED_SLOW * 5 || !options) {
				dom.empty(this.list);
				options = this.generateOptions();
				this.lastCache = now;
			}
			if (!this.list.children.length) this.list.append(...options);
		}
		generateOptions() {
			this.optionsCache = componentOptions(this);
			return this.optionsCache;
		}
		setListPosition() {
			const { offsetHeight, offsetWidth } = this.displayField;
			const containerRect = this.displayField.closest(".formeo-stage").getBoundingClientRect();
			const triggerRect = this.displayField.getBoundingClientRect();
			const listStyle = {
				position: "absolute",
				top: `${triggerRect.y + offsetHeight - containerRect.y}px`,
				left: `${triggerRect.x + window.scrollX - containerRect.x + 2}px`,
				width: `${offsetWidth}px`
			};
			Object.assign(this.list.style, listStyle);
		}
		/**
		* Shows autocomplete list. Automatically selects 'selectedOption'
		* @param {Object} list - list of autocomplete options
		* @param {Object} selectedOption - option to be selected
		*/
		showList(selectedOption, list = this.list) {
			if (!this.stage.contains(this.list)) this.stage.appendChild(this.list);
			this.setListPosition();
			this.selectOption(selectedOption);
			animate.slideDown(list, ANIMATION_SPEED_FAST);
		}
		/**
		* Hides autocomplete list and deselects all the options
		* @param {Object} list - list of autocomplete options
		*/
		hideList(list = this.list) {
			animate.slideUp(list, ANIMATION_SPEED_FAST);
			this.removeHighlight();
			if (this.stage.contains(this.list)) this.stage.removeChild(this.list);
		}
		/**
		* Returns first option from autocomplete list with 'active-option' class
		* @param {Object} list - list of autocomplete options
		* @return {Object} first list option with 'active-option' class
		*/
		getActiveOption(list = this.list) {
			const activeOption = list.querySelector(".active-option");
			if (activeOption?.style.display !== "none") return activeOption;
			return null;
		}
		/**
		* Previous next option to the current option
		* @param {Object} current - currently selected option
		* @return {Object} previous option to the current option or null if previous doesn't exist
		*/
		getPreviousOption(current) {
			let previous = current;
			do
				previous = previous ? previous.previousSibling : null;
			while (previous != null && previous.style.display === "none");
			return previous;
		}
		/**
		* Returns next option to the current option
		* @param {Object} current - currently selected option
		* @return {Object} next option to the current option or null if next doesn't exist
		*/
		getNextOption(current) {
			let next = current;
			do
				next = next ? next.nextSibling : null;
			while (next != null && next.style.display === "none");
			return next;
		}
		/**
		* Selects option in autocomplete list. Removes class 'active-option' from all options
		* and then adds that class to 'selected' option. If 'selected' is null then no option is selected
		* @param {Object} list - list of autocomplete options
		* @param {Object} selectedOption - option - 'li' element - to be selected in autocomplete list
		*/
		selectOption(selectedOption, list = this.list) {
			const options = list.querySelectorAll("li");
			for (const option of options) {
				const { dataset: { value } } = option;
				option.classList.remove("active-option");
				if (isAddress(value)) components.getAddress(value)?.dom?.classList.remove(HIGHLIGHT_CLASSNAME);
			}
			if (selectedOption) {
				selectedOption.classList.add("active-option");
				this.highlightComponent(selectedOption);
			}
		}
		/**
		* removes the highlight from
		*/
		removeHighlight() {
			const highlightedComponents = document.getElementsByClassName(HIGHLIGHT_CLASSNAME);
			for (const component of highlightedComponents) component.classList.remove(HIGHLIGHT_CLASSNAME);
		}
		/**
		* Highlight a component that maps to the option
		*/
		highlightComponent(option) {
			const { dataset: { value } } = option;
			if (isAddress(value)) {
				const { componentAddress, isOptionAddress, optionIndex } = splitAddress(value).reduce((acc, cur) => {
					if (cur === "options") {
						acc.isOptionAddress = true;
						return acc;
					}
					if (!acc.isOptionAddress) {
						acc.componentAddress.push(cur);
						return acc;
					}
					acc.optionIndex = +cur;
					return acc;
				}, {
					componentAddress: [],
					optionIndex: null,
					isOptionAddress: false
				});
				const component = components.getAddress(componentAddress);
				if (component?.dom) {
					component.dom.classList.add(HIGHLIGHT_CLASSNAME);
					if (isOptionAddress) component.dom.querySelectorAll(".field-preview .f-checkbox, .field-preview .f-radio")[optionIndex]?.classList.add(HIGHLIGHT_CLASSNAME);
				}
			}
		}
		/**
		* Clears the autocomplete values and fires onChange event
		*/
		clearValue() {
			this.selectOption(null);
			this.setValue({ dataset: {
				label: "",
				value: ""
			} });
			this.displayField.focus();
		}
		/**
		* Sets the hidden and display values
		* @param {String} label display text
		* @param {String} value display text
		*/
		setValue(target) {
			const { label, value } = target.dataset;
			this.displayField.value = label;
			this.hiddenField.value = value;
			this.value = value;
			this.clearButton.classList.toggle("hidden", !value.length);
			this.onChange?.({ target: this.hiddenField });
		}
	};
}));
//#endregion
//#region src/lib/js/components/edit-panel/helpers.mjs
function inputConfigBase({ key, value, type = "text", checked }) {
	const config = {
		tag: "input",
		attrs: {
			type,
			value,
			placeholder: keyToPlaceHolder(key)
		},
		className: [keyToClassName(key)],
		config: {}
	};
	if (checked) config.attrs.checked = true;
	return config;
}
function largeTextInputConfigBase({ key, value }) {
	return {
		tag: "textarea",
		attrs: { placeholder: keyToPlaceHolder(key) },
		className: [keyToClassName(key)],
		config: {},
		textContent: value
	};
}
function labelHelper(key) {
	const labelText = s.get(key);
	if (labelText) return labelText;
	const trimmedKey = trimKeyPrefix(key);
	return s.get(trimmedKey) || toTitleCase(trimmedKey);
}
var keyToPlaceHolder, keyToClassName, stringInputTypeMap, ITEM_INPUT_TYPE_MAP, INPUT_TYPE_ACTION;
var init_helpers = __esmMin((() => {
	init_i18n_es_min();
	init_dom();
	init_string();
	init_autocomplete();
	keyToPlaceHolder = (key) => s.get(`${key}.placeholder`) || toTitleCase(trimKeyPrefix(key));
	keyToClassName = (key) => key.replaceAll(".", "-");
	stringInputTypeMap = new Map([["config.helpText", (...args) => largeTextInputConfigBase(...args)], ["config.tooltip", (...args) => largeTextInputConfigBase(...args)]]);
	ITEM_INPUT_TYPE_MAP = {
		autocomplete: (...args) => new Autocomplete(...args).createProxy(),
		string: ({ key, value }) => {
			if (stringInputTypeMap.has(key)) return stringInputTypeMap.get(key)({
				key,
				value
			});
			return inputConfigBase({
				key,
				value
			});
		},
		boolean: ({ key, value }) => {
			return inputConfigBase({
				key,
				value,
				type: key === "selected" ? "radio" : "checkbox",
				checked: !!value
			});
		},
		number: ({ key, value }) => inputConfigBase({
			key,
			value,
			type: "number"
		}),
		array: ({ key, value }) => {
			return {
				tag: "select",
				attrs: { placeholder: labelHelper(`placeholder.${key}`) },
				className: [keyToClassName(key)],
				options: value
			};
		},
		object: (valObj) => {
			return Object.entries(valObj).map(([key, value]) => {
				return ITEM_INPUT_TYPE_MAP[dom.childType(value)]({
					key,
					value
				});
			});
		}
	};
	INPUT_TYPE_ACTION = {
		boolean: (dataKey, field) => ({ click: ({ target }) => {
			if (target.type === "radio") {
				const updatedOptions = field.data.options.map((option) => ({
					...option,
					selected: false
				}));
				field.set("options", updatedOptions);
			}
			field.set(dataKey, target.checked);
			field.updatePreview();
		} }),
		string: (dataKey, field) => ({ input: ({ target: { value } }) => {
			field.set(dataKey, value);
			field.debouncedUpdatePreview();
		} }),
		number: (dataKey, field) => ({ input: ({ target: { value } }) => {
			field.set(dataKey, Number(value));
			field.debouncedUpdatePreview();
		} }),
		array: (dataKey, field) => ({ change: ({ target: { value } }) => {
			field.set(dataKey, value);
			field.debouncedUpdatePreview();
		} }),
		object: () => ({})
	};
}));
//#endregion
//#region src/lib/js/components/dialog.js
var defaults$3, Dialog;
var init_dialog = __esmMin((() => {
	init_i18n_es_min();
	init_dom();
	init_utils();
	init_helpers();
	defaults$3 = Object.freeze({
		title: "",
		content: null,
		confirmText: () => labelHelper("save"),
		cancelText: () => labelHelper("cancel"),
		onConfirm: () => {},
		onCancel: () => {},
		className: "",
		closeOnEscape: true,
		position: "top",
		triggerElement: null,
		triggerCoords: null
	});
	Dialog = class Dialog {
		/**
		* Creates a new Dialog instance
		* @param {Object} options - Dialog configuration options
		* @param {string} [options.title] - Dialog title
		* @param {Object|Array} [options.content] - DOM config for dialog body content
		* @param {Function} [options.onConfirm] - Callback when form is submitted (receives FormData)
		* @param {Function} [options.onCancel] - Callback when dialog is cancelled
		* @param {string|Function} [options.confirmText] - Confirm button text
		* @param {string|Function} [options.cancelText] - Cancel button text
		* @param {string} [options.className] - Additional CSS class name(s)
		* @param {boolean} [options.closeOnEscape] - Whether Escape key closes dialog
		* @param {string} [options.position] - Positioning mode: 'top' (upper center), 'center', or 'trigger' (near trigger element)
		* @param {HTMLElement} [options.triggerElement] - Element that triggered dialog (for position: 'trigger')
		* @param {Object} [options.triggerCoords] - Manual coordinates {x, y} (for position: 'trigger')
		*/
		constructor(options) {
			this.opts = merge(defaults$3, options);
			this.dialog = null;
		}
		/**
		* Creates the dialog DOM structure
		* @returns {HTMLDialogElement} The created dialog element
		*/
		createDialog() {
			const { title, content, confirmText, cancelText, className, closeOnEscape, position } = this.opts;
			const positionClass = `dialog-position-${position}`;
			const formChildren = [];
			if (title) formChildren.push({
				tag: "h3",
				className: "dialog-title",
				textContent: title
			});
			if (content) formChildren.push({
				tag: "div",
				className: "dialog-body",
				children: Array.isArray(content) ? content : [content]
			});
			formChildren.push({
				tag: "div",
				className: "dialog-actions",
				children: [{
					tag: "button",
					type: "button",
					className: "btn btn-sm btn-secondary",
					textContent: typeof cancelText === "function" ? cancelText() : cancelText,
					action: { click: () => this.handleCancel() }
				}, {
					tag: "button",
					type: "submit",
					className: "btn btn-sm btn-primary",
					textContent: typeof confirmText === "function" ? confirmText() : confirmText
				}]
			});
			return dom.create({
				tag: "dialog",
				className: [
					"formeo-dialog",
					"formeo",
					positionClass,
					className
				],
				children: [{
					tag: "form",
					className: "dialog-form",
					method: "dialog",
					children: formChildren,
					action: { submit: (e) => this.handleSubmit(e) }
				}],
				action: { cancel: (e) => {
					if (closeOnEscape) this.handleCancel();
					else e.preventDefault();
				} }
			});
		}
		/**
		* Handles form submission
		* @param {Event} e - Submit event
		*/
		handleSubmit(e) {
			e.preventDefault();
			const formData = new FormData(e.target);
			this.opts.onConfirm(formData, this);
			this.close();
		}
		/**
		* Handles dialog cancellation
		*/
		handleCancel() {
			this.opts.onCancel(this);
			this.close();
		}
		/**
		* Sets dialog position based on trigger element or coordinates
		*/
		setPosition() {
			const { position, triggerElement, triggerCoords } = this.opts;
			if (position !== "trigger" || !this.dialog) return;
			let coords = triggerCoords;
			if (!coords && triggerElement) {
				const rect = triggerElement.getBoundingClientRect();
				coords = {
					x: rect.left + rect.width / 2,
					y: rect.bottom + 8
				};
			}
			if (coords) {
				const dialogRect = this.dialog.getBoundingClientRect();
				const viewportWidth = window.innerWidth;
				const viewportHeight = window.innerHeight;
				let left = coords.x - dialogRect.width / 2;
				let top = coords.y;
				const padding = 16;
				left = Math.max(padding, Math.min(left, viewportWidth - dialogRect.width - padding));
				top = Math.max(padding, Math.min(top, viewportHeight - dialogRect.height - padding));
				this.dialog.style.left = `${left}px`;
				this.dialog.style.top = `${top}px`;
				this.dialog.style.transform = "none";
			}
		}
		/**
		* Opens the dialog
		* @returns {Dialog} This dialog instance for chaining
		*/
		open() {
			if (!this.dialog) this.dialog = this.createDialog();
			document.body.appendChild(this.dialog);
			this.dialog.showModal();
			if (this.opts.position === "trigger") {
				const setTimeoutId = setTimeout(() => {
					this.setPosition();
					clearTimeout(setTimeoutId);
				}, 0);
			}
			return this;
		}
		/**
		* Closes and removes the dialog
		*/
		close() {
			if (this.dialog) {
				this.dialog.close();
				this.dialog.remove();
				this.dialog = null;
			}
		}
		/**
		* Static shorthand for simple alert dialog
		* @param {string} message - Alert message
		* @param {Function} [onConfirm] - Optional callback when confirmed
		* @returns {Dialog} Dialog instance
		*/
		static alert(message, onConfirm = () => {}) {
			return new Dialog({
				content: {
					tag: "p",
					className: "dialog-message",
					textContent: message
				},
				confirmText: () => s.get("ok") || "OK",
				cancelText: "",
				onConfirm: () => onConfirm()
			});
		}
		/**
		* Static shorthand for confirmation dialog
		* @param {string} message - Confirmation question
		* @param {Function} [onConfirm] - Callback when confirmed
		* @param {Function} [onCancel] - Callback when cancelled
		* @returns {Dialog} Dialog instance
		*/
		static confirm(message, onConfirm = () => {}, onCancel = () => {}) {
			return new Dialog({
				content: {
					tag: "p",
					className: "dialog-message",
					textContent: message
				},
				confirmText: () => s.get("confirm") || "Confirm",
				onConfirm: () => onConfirm(),
				onCancel: () => onCancel()
			});
		}
		/**
		* Static shorthand for prompt dialog
		* @param {string} message - Prompt message
		* @param {Function} onSubmit - Callback with user input value
		* @param {string} [defaultValue] - Default input value
		* @returns {Dialog} Dialog instance
		*/
		static prompt(message, onSubmit = () => {}, defaultValue = "") {
			return new Dialog({
				content: [{
					tag: "label",
					className: "dialog-prompt-label",
					children: [{
						tag: "p",
						className: "dialog-message",
						textContent: message
					}, {
						tag: "input",
						type: "text",
						name: "prompt-value",
						className: "dialog-prompt-input",
						value: defaultValue
					}]
				}],
				onConfirm: (formData) => {
					onSubmit(formData.get("prompt-value"));
				}
			});
		}
	};
}));
//#endregion
//#region src/lib/js/components/edit-panel/condition-helpers.mjs
function getOptionConfigs({ key: fieldName, value: fieldValue, conditionType }) {
	return Object.entries(optionDataMap[`${conditionType}-${fieldName}`] || {}).map(([key, optionValue]) => makeOptionDomConfig({
		fieldName,
		fieldValue,
		key,
		optionValue
	}));
}
function makeOptionDomConfig({ fieldName, fieldValue, key, optionValue }) {
	return {
		label: s.get(`${fieldName}.${key}`) || toTitleCase(key).toLowerCase(),
		value: optionValue,
		selected: optionValue === fieldValue
	};
}
function createConditionSelect({ key, value, onChange, conditionType }) {
	const optionConfigs = getOptionConfigs({
		key,
		value,
		conditionType
	});
	const propertyFieldConfig = ITEM_INPUT_TYPE_MAP.array({
		key: `condition.${key}`,
		value: optionConfigs
	});
	propertyFieldConfig.action = { change: onChange };
	return propertyFieldConfig;
}
var hiddenPropertyClassname, hiddenOptionClassname, optionsAddressRegex, optionDataMap, segmentTypes, isVisible$1, fieldVisibilityMap, toggleFieldVisibility, isCheckedValue, isCheckedOption, toggleCheckablePropertyOptions;
var init_condition_helpers = __esmMin((() => {
	init_i18n_es_min();
	init_dom();
	init_utils();
	init_object();
	init_string();
	init_constants();
	init_helpers();
	hiddenPropertyClassname = "hidden-property";
	hiddenOptionClassname = "hidden-option";
	optionsAddressRegex = /\.options\[\d+\]$/;
	optionDataMap = {
		"if-sourceProperty": objectFromStringArray(PROPERTY_OPTIONS, CHECKABLE_OPTIONS, VISIBLE_OPTIONS),
		"if-targetProperty": objectFromStringArray(PROPERTY_OPTIONS),
		"then-targetProperty": objectFromStringArray(PROPERTY_OPTIONS, CHECKABLE_OPTIONS, VISIBLE_OPTIONS),
		...Object.entries(OPERATORS).reduce((acc, [key, value]) => {
			acc[`if-${key}`] = value;
			acc[`then-${key}`] = value;
			return acc;
		}, {})
	};
	segmentTypes = {
		assignment: createConditionSelect,
		comparison: createConditionSelect,
		logical: createConditionSelect,
		source: ({ key: keyArg, value, onChange, conditionType }) => {
			return ITEM_INPUT_TYPE_MAP.autocomplete({
				key: `${conditionType}.condition.${keyArg}`,
				value,
				onChange,
				className: `condition-${keyArg}`
			});
		},
		sourceProperty: createConditionSelect,
		targetProperty: createConditionSelect,
		target: (args) => segmentTypes.source(args),
		value: ({ key, value, onChange }, _conditionValues) => {
			const valueField = ITEM_INPUT_TYPE_MAP.string({
				key: `condition.${key}`,
				value
			});
			valueField.action = { input: onChange };
			return valueField;
		}
	};
	isVisible$1 = (elem) => {
		return !elem?.classList.contains(hiddenPropertyClassname);
	};
	fieldVisibilityMap = {
		sourceProperty: (fields) => {
			const source = fields.get("source");
			const sourceProperty = fields.get("sourceProperty");
			const sourceHasValue = !!source.value;
			toggleCheckablePropertyOptions(!!source.value.match(optionsAddressRegex), sourceProperty);
			return !sourceHasValue;
		},
		comparison: (fields) => {
			const source = fields.get("source");
			const sourceProperty = fields.get("sourceProperty");
			const sourceHasValue = !!source.value;
			const sourceValueIsCheckable = !!source.value.match(optionsAddressRegex);
			return !sourceHasValue || sourceValueIsCheckable || sourceProperty.value !== "value";
		},
		assignment: (fields) => {
			const target = fields.get("target");
			const targetProperty = fields.get("targetProperty");
			return !!!target.value || targetProperty.value.startsWith("is");
		},
		targetProperty: (fields) => {
			const target = fields.get("target");
			const targetProperty = fields.get("targetProperty");
			toggleCheckablePropertyOptions(!!target.value.match(optionsAddressRegex), targetProperty);
			return !isInternalAddress(target.value);
		},
		target: (fields) => {
			const source = fields.get("source");
			const sourceProperty = fields.get("sourceProperty");
			const sourceHasValue = !!source?.value;
			if (sourceProperty && !sourceHasValue) return true;
			return sourceProperty && sourceProperty?.value !== "value";
		},
		value: (fields) => {
			const target = fields.get("target");
			const targetProperty = fields.get("targetProperty");
			if (targetProperty === void 0) return false;
			if (target && !target.value) return true;
			if (!isVisible$1(fields.get("comparison"))) return true;
			if (targetProperty.value === isCheckedValue) return true;
			return targetProperty.value.startsWith("is");
		}
	};
	toggleFieldVisibility = (fields) => {
		for (const [fieldName, field] of fields) {
			const shouldHide = !!fieldVisibilityMap[fieldName]?.(fields) || false;
			field.classList.toggle(hiddenPropertyClassname, shouldHide);
		}
	};
	isCheckedValue = "isChecked";
	isCheckedOption = (option) => option.value.endsWith("Checked");
	toggleCheckablePropertyOptions = (isCheckable, propertyField) => {
		if (isCheckable && isCheckedOption(propertyField)) return null;
		const options = Array.from(propertyField.querySelectorAll("option"));
		const hiddenOptionValues = [];
		for (const option of options) {
			const optionIsChecked = isCheckedOption(option);
			const shouldHide = isCheckable ? !optionIsChecked : optionIsChecked;
			if (shouldHide) hiddenOptionValues.push(option.value);
			option.classList.toggle(hiddenOptionClassname, shouldHide);
		}
		if (hiddenOptionValues.includes(propertyField.value)) propertyField.value = isCheckable ? isCheckedValue : options.find((opt) => !isCheckedOption(opt))?.value || propertyField.value;
	};
}));
//#endregion
//#region src/lib/js/components/edit-panel/condition.mjs
function orderConditionValues(conditionValues, fieldOrder = CONDITION_INPUT_ORDER) {
	return fieldOrder.reduce((acc, fieldName) => {
		if (conditionValues[fieldName] !== void 0) acc.push([fieldName, conditionValues[fieldName]]);
		return acc;
	}, []);
}
var Condition;
var init_condition = __esmMin((() => {
	init_i18n_es_min();
	init_animation();
	init_dom();
	init_events();
	init_utils();
	init_constants();
	init_components();
	init_condition_helpers();
	Condition = class {
		constructor({ conditionValues, conditionType, conditionCount, index }, parent) {
			this.values = new Map(orderConditionValues(conditionValues));
			this.conditionType = conditionType;
			this.parent = parent;
			this.baseAddress = `${parent.address}.${conditionType}`;
			this.fields = /* @__PURE__ */ new Map();
			this.conditionCount = conditionCount;
			this.index = index;
			this.dom = this.generateDom();
		}
		setConditionIndex(index) {
			this.index = index;
		}
		get address() {
			return `${this.baseAddress}[${this.index}]`;
		}
		destroy() {
			const conditions = components.getAddress(this.baseAddress);
			conditions.splice(this.index, 1);
			components.setAddress(this.baseAddress, conditions);
			animate.slideUp(this.dom, ANIMATION_SPEED_FAST, () => {
				this.dom.remove();
			});
		}
		label() {
			if (this.index) return null;
			return {
				tag: "label",
				className: `condition-label ${this.conditionType}-condition-label`,
				content: s.get(`condition.type.${this.conditionType}`)
			};
		}
		generateDom() {
			const fieldsDom = [];
			for (const [key, value] of this.values) {
				const onChange = (evt) => this.onChangeCondition({
					key,
					target: evt.target
				});
				const fieldArgs = {
					key,
					value,
					conditionType: this.conditionType,
					onChange
				};
				const conditionField = segmentTypes[key](fieldArgs, this.values);
				const conditionFieldDom = conditionField.dom || dom.create(conditionField);
				this.fields.set(key, conditionField.dom ? conditionField : conditionFieldDom);
				fieldsDom.push(conditionFieldDom);
			}
			const conditionTypeRow = {
				children: [
					this.label(),
					...fieldsDom,
					...this.generateConditionTypeActionButtons()
				],
				className: `f-condition-row ${this.conditionType}-condition-row display-none`,
				action: { onRender: (_elem) => {
					this.processUiState();
				} }
			};
			return dom.create(conditionTypeRow);
		}
		generateConditionTypeActionButtons() {
			const actionButtons = [];
			const manageConditionClassname = "manage-condition-type";
			const manageConditionActionClassname = (action) => `${action}-condition-type`;
			const removeConditionType = dom.btnTemplate({
				title: s.get(`remove${this.conditionType}Condition`),
				className: [manageConditionClassname, manageConditionActionClassname("remove")],
				content: dom.icon("minus"),
				action: {
					click: () => this.destroy(),
					mouseover: (_evt) => {
						this.dom.classList.add("to-remove");
					},
					mouseout: (_evt) => {
						this.dom.classList.remove("to-remove");
					}
				}
			});
			actionButtons.push(removeConditionType);
			const addConditionType = dom.btnTemplate({
				title: s.get(`add${this.conditionType}Condition`),
				className: [manageConditionClassname, manageConditionActionClassname("add")],
				content: dom.icon("plus"),
				action: { click: () => {
					const condition = this.parent.addConditionType(this.conditionType);
					const evtData = {
						changedProperty: null,
						dataPath: condition.address,
						value: condition.value,
						src: condition.dom
					};
					this.updateDataDebounced(evtData);
				} }
			});
			actionButtons.push(addConditionType);
			return actionButtons;
		}
		get value() {
			return Array.from(this.fields).reduce((acc, [key, field]) => {
				acc[key] = field.value;
				return acc;
			}, {});
		}
		processUiState() {
			toggleFieldVisibility(this.fields);
			this.dom.classList.remove("display-none");
		}
		updateDataDebounced = debounce((evtData) => {
			events.formeoUpdated(evtData);
			components.setAddress(evtData.dataPath, evtData.value);
		});
		onChangeCondition = ({ key, target }) => {
			const evtData = {
				changedProperty: key,
				dataPath: this.address,
				value: this.value,
				src: target
			};
			toggleFieldVisibility(this.fields);
			this.updateDataDebounced(evtData);
		};
	};
}));
//#endregion
//#region src/lib/js/components/edit-panel/edit-panel-item.mjs
var panelDataKeyMap, toggleOptionMultiSelect, itemInputActions, EditPanelItem;
var init_edit_panel_item = __esmMin((() => {
	init_animation();
	init_dom();
	init_helpers$2();
	init_utils();
	init_object();
	init_string();
	init_constants();
	init_condition();
	init_helpers();
	panelDataKeyMap = new Map([["attrs", ({ itemKey }) => itemKey], ["options", ({ itemKey, key }) => `${itemKey}.${key}`]]);
	toggleOptionMultiSelect = (isMultiple, field) => {
		if (field.controlId === "select") {
			const optionsPanel = field.editPanels.get("options");
			const [fromCheckedType, toCheckedType] = isMultiple ? CHECKED_TYPES : REVERSED_CHECKED_TYPES;
			const updatedOptionsData = optionsPanel.data.map(({ [fromCheckedType]: val, ...option }) => ({
				[toCheckedType]: val,
				...option
			}));
			optionsPanel.setData(updatedOptionsData);
		}
	};
	itemInputActions = new Map([["attrs-multiple", (editPanelItem) => ({ change: ({ target }) => {
		if (editPanelItem.field.controlId === "select") toggleOptionMultiSelect(target.checked, editPanelItem.field);
	} })]]);
	EditPanelItem = class {
		/**
		* Set defaults and load panelData
		* @param  {String} itemKey attribute name or options index
		* @param  {Object} itemData existing field ID
		* @param  {String} field
		* @return {Object} field object
		*/
		constructor({ key, index, field, panel, data }) {
			this.field = field;
			this.itemKey = key;
			this.itemIndex = index;
			this.panel = panel;
			this.panelName = panel.name;
			this.isDisabled = field.isDisabledProp(key, this.panelName);
			this.isHidden = this.isDisabled && field.config.panels[this.panelName].hideDisabled;
			this.isLocked = field.isLockedProp(key, this.panelName);
			this.address = `${field.indexName}.${field.id}.${key}`;
			this.itemSlug = slugifyAddress(key);
			this.conditionTypeWrap = /* @__PURE__ */ new Map();
			if (data !== void 0 && this.field.get(this.itemKey) === void 0) this.field.set(this.itemKey, data);
			const liClassList = [`field-${this.itemSlug}`, "prop-wrap"];
			if (this.isHidden) liClassList.push("hidden-property");
			this.dom = dom.create({
				tag: "li",
				className: liClassList,
				children: {
					className: "component-prop",
					children: [this.itemInputs(), this.itemControls]
				}
			});
		}
		get itemValues() {
			const val = this.field.get(this.itemKey);
			if (val?.constructor === Object) return orderObjectsBy(Object.entries(val), CHECKED_TYPES, "0");
			return [[this.itemKey, val]];
		}
		findOrCreateConditionTypeWrap(conditionType) {
			let conditionTypeWrap = this.conditionTypeWrap.get(conditionType);
			if (conditionTypeWrap) return conditionTypeWrap;
			conditionTypeWrap = dom.create({ className: `type-conditions-wrap ${conditionType}-conditions-wrap` });
			this.conditionTypeWrap.set(conditionType, conditionTypeWrap);
			return conditionTypeWrap;
		}
		itemInputs() {
			const inputs = dom.create({
				className: `${this.panelName}-prop-inputs prop-inputs f-input-group`,
				children: this.itemValues.map(([key, val]) => {
					if (this.panelName === "conditions") return this.generateConditionFields(key, val);
					return this.itemInput(key, val);
				})
			});
			if (this.inputs) this.inputs.replaceWith(inputs);
			this.inputs = inputs;
			return inputs;
		}
		addConditionType = (conditionType, conditionArg) => {
			const conditionTypeWrap = this.findOrCreateConditionTypeWrap(conditionType);
			let condition = conditionArg;
			if (!condition) {
				const [newConditionData] = CONDITION_TEMPLATE()[conditionType];
				const conditionCount = conditionTypeWrap.children.length;
				if (conditionType === "if") newConditionData.logical = "||";
				condition = {
					conditionValues: newConditionData,
					conditionCount,
					index: conditionCount
				};
			}
			const conditionField = new Condition({
				conditionType,
				...condition
			}, this);
			conditionTypeWrap.appendChild(conditionField.dom);
			return conditionField;
		};
		removeConditionType = (conditionType, index) => {
			const conditionField = this.conditionTypeWrap.get(conditionType).children[index];
			conditionField.destroy();
			conditionField.dom.remove();
		};
		generateConditionFields = (conditionType, conditionVals) => {
			this.conditions = /* @__PURE__ */ new Map();
			conditionVals.forEach((condition, index) => {
				const conditionField = this.addConditionType(conditionType, {
					index,
					conditionCount: conditionVals.length,
					conditionValues: condition
				});
				this.conditions.set(index, conditionField);
			});
			return this.findOrCreateConditionTypeWrap(conditionType);
		};
		get itemControls() {
			if (this.isLocked) return {
				className: `${this.panelName}-prop-controls prop-controls`,
				content: []
			};
			const remove = {
				tag: "button",
				attrs: {
					type: "button",
					className: "prop-remove prop-control"
				},
				action: {
					click: () => {
						animate.slideUp(this.dom, 333, (elem) => {
							this.field.remove(this.itemKey);
							elem.remove();
							this.panel.updateProps();
						});
					},
					mouseover: (_evt) => {
						this.dom.classList.add("to-remove");
					},
					mouseout: (_evt) => {
						this.dom.classList.remove("to-remove");
					}
				},
				content: dom.icon("remove")
			};
			return {
				className: `${this.panelName}-prop-controls prop-controls`,
				content: [remove]
			};
		}
		/**
		* Get config-provided options for an attribute
		* @param {String} attrKey - The attribute key (e.g., 'attrs.type')
		* @returns {Array|null} Array of options if config provides them, null otherwise
		*/
		getConfigAttrOptions(attrKey) {
			const attrName = attrKey.split(".").pop();
			const configValue = this.field.config?.attrs?.[attrName];
			if (Array.isArray(configValue)) return configValue;
			return null;
		}
		itemInput(key, value) {
			if (this.isDisabled) return null;
			let valType = dom.childType(value) || "string";
			let effectiveValue = value;
			if (this.panelName === "attrs") {
				const configAttrOptions = this.getConfigAttrOptions(key);
				if (configAttrOptions) {
					effectiveValue = configAttrOptions.map((opt) => ({
						...opt,
						selected: opt.value === value
					}));
					valType = "array";
				}
			}
			const dataKey = panelDataKeyMap.get(this.panelName)?.({
				itemKey: this.itemKey,
				key
			}) || this.itemKey;
			const labelKey = dataKey.split(".").filter(Number.isNaN).join(".") || key;
			const baseConfig = ITEM_INPUT_TYPE_MAP[valType]({
				key,
				value: effectiveValue
			});
			const name = `${this.field.shortId}-${slugifyAddress(dataKey).replaceAll(/-\d+-(selected)/g, "-$1")}`;
			const config = {
				label: this.panelName !== "options" && labelHelper(labelKey),
				labelAfter: false,
				inputWrap: [
					"f-input-wrap",
					this.isLocked && "locked-prop",
					this.isDisabled && "disabled-prop"
				].filter(Boolean).join(" ")
			};
			const attrs = { name: baseConfig.attrs.type === "checkbox" ? `${name}[]` : name };
			attrs.disabled = this.isDisabled;
			attrs.readonly = this.isLocked;
			const itemInputAction = itemInputActions.get(this.itemSlug)?.(this);
			const action = mergeActions(INPUT_TYPE_ACTION[valType](dataKey, this.field), itemInputAction || {});
			const inputConfig = merge(ITEM_INPUT_TYPE_MAP[valType]({
				key,
				value: effectiveValue
			}), {
				action,
				attrs,
				config
			});
			if (CHECKED_TYPES.includes(key)) return {
				className: "f-addon",
				children: inputConfig
			};
			return inputConfig;
		}
	};
}));
//#endregion
//#region src/lib/js/components/edit-panel/edit-panel.js
var addAttributeActions, defaultConfigOptions, defaultConfigValues, EditPanel;
var init_edit_panel = __esmMin((() => {
	init_i18n_es_min();
	init_actions();
	init_dom();
	init_helpers$2();
	init_string();
	init_constants();
	init_dialog();
	init_edit_panel_item();
	init_helpers();
	addAttributeActions = { multiple: (val, field) => {
		toggleOptionMultiSelect(!!val, field);
	} };
	defaultConfigOptions = [
		{
			label: labelHelper("config.label"),
			value: "label"
		},
		{
			label: labelHelper("config.hideLabel"),
			value: "hideLabel"
		},
		{
			label: labelHelper("config.helpText"),
			value: "helpText"
		},
		{
			label: labelHelper("config.labelAfter"),
			value: "labelAfter"
		},
		{
			label: labelHelper("config.disableHtmlLabel"),
			value: "disableHtmlLabel"
		},
		{
			label: labelHelper("config.tooltip"),
			value: "tooltip"
		}
	];
	defaultConfigValues = {
		label: "New Field",
		hideLabel: false,
		helpText: "",
		labelAfter: false,
		disableHtmlLabel: false,
		tooltip: ""
	};
	EditPanel = class {
		/**
		* Set defaults and load panelData
		* @param  {Object} panelData existing field ID
		* @param  {String} panelName name of panel
		* @param  {String} component
		* @return {Object} field object
		*/
		constructor(panelData, panelName, component) {
			this.type = dom.childType(panelData);
			this.name = panelName;
			this.component = component;
			this.panelConfig = this.getPanelConfig(this.data);
		}
		get data() {
			const data = this.component.get(this.name);
			return this.type === "object" ? Object.entries(data) : data;
		}
		getPanelConfig(data) {
			this.props = this.createProps(data);
			this.editButtons = this.createEditButtons();
			return {
				config: { label: s.get(`panel.label.${this.name}`) },
				attrs: { className: `${PANEL_CLASSNAME} ${this.name}-panel` },
				children: [this.props, this.editButtons]
			};
		}
		/**
		* Generates the edit panel for attrs, meta and options for a fields(s)
		* @param  {String} panelName
		* @param  {Object} dataObj   field config object
		* @return {Object}           formeo DOM config object
		*/
		createProps(data = this.data) {
			this.editPanelItems = Array.from(data).map((dataVal, index) => {
				const isArray = this.type === "array";
				const keyBase = dataVal[0];
				const key = isArray ? `[${index}]` : `.${dataVal[0]}`;
				const val = isArray ? dataVal : { [dataVal[0]]: dataVal[1] };
				const itemKey = `${this.name}${key}`;
				const isDisabledProp = this.component.isDisabledProp(itemKey, this.name);
				const isEditableProp = FILTERED_PANEL_DATA_KEYS.get(this.name)?.has(keyBase) ?? true;
				if (isDisabledProp || !isEditableProp) return null;
				return new EditPanelItem({
					key: itemKey,
					data: val,
					field: this.component,
					index,
					panel: this
				});
			}).filter(Boolean);
			const editGroupConfig = {
				tag: "ul",
				attrs: { className: [
					"edit-group",
					`${this.component.name}-edit-group`,
					`${this.component.name}-edit-${this.name}`
				] },
				editGroup: this.name,
				isSortable: this.name === "options",
				content: this.editPanelItems
			};
			return dom.create(editGroupConfig);
		}
		updateProps() {
			const newProps = this.createProps();
			this.props.replaceWith(newProps);
			this.props = newProps;
		}
		/**
		* Generate edit buttons for interacting with attrs and options panel
		* @return {Object} panel edit buttons config
		*/
		createEditButtons() {
			const type = this.name;
			const addActions = {
				attrs: this.addAttribute,
				options: this.addOption,
				conditions: this.addCondition,
				config: this.addConfiguration
			};
			const editPanelButtons = [];
			if (type === "conditions") {
				if (s.current && !s.current.clearAll) s.put("clearAll", "Clear All");
				const clearAllBtn = {
					...dom.btnTemplate({
						content: [dom.icon("bin"), s.get("clearAll")],
						title: s.get("clearAll")
					}),
					className: `clear-all-${type}`,
					action: { click: () => {
						this.clearAllItems();
					} }
				};
				editPanelButtons.push(clearAllBtn);
			}
			const addBtnTitle = s.get(`panelEditButtons.${type}`) || `+ Add ${toTitleCase(type)}`;
			const addBtn = {
				...dom.btnTemplate({
					content: addBtnTitle,
					title: addBtnTitle
				}),
				className: `add-${type}`,
				action: { click: (evt) => {
					const addEvt = {
						btnCoords: dom.coords(evt.target),
						addAction: addActions[type]
					};
					if (type === "attrs") {
						addEvt.isDisabled = this.component.isDisabledProp;
						addEvt.isLocked = this.component.isLockedProp;
						addEvt.message = {
							attr: s.get(`action.add.${type}.attr`),
							value: s.get(`action.add.${type}.value`)
						};
					}
					const eventType = toTitleCase(type);
					const customEvt = new globalThis.CustomEvent(`onAdd${eventType}`, { detail: addEvt });
					actions.add[type](addEvt);
					document.dispatchEvent(customEvt);
				} }
			};
			editPanelButtons.push(addBtn);
			return {
				className: "panel-action-buttons",
				content: editPanelButtons
			};
		}
		/**
		* Add a new attribute to the attrs panels
		* @param {String} attr
		* @param {String|Array} val
		*/
		addAttribute = (attr, valArg) => {
			let val = valArg;
			const safeAttr = safeAttrName(attr);
			const itemKey = `attrs.${safeAttr}`;
			if (!s.current[itemKey]) s.put(itemKey, capitalize(attr));
			if (typeof val === "string" && ["true", "false"].includes(val)) val = JSON.parse(val);
			this.component.set(`attrs.${attr}`, val);
			addAttributeActions[safeAttr]?.(val, this.component);
			const existingAttr = this.props.querySelector(`.${this.component.name}-attrs-${safeAttr}`);
			const newAttr = new EditPanelItem({
				key: itemKey,
				data: { [safeAttr]: val },
				field: this.component,
				panel: this
			});
			if (existingAttr) existingAttr.replaceWith(newAttr.dom);
			else this.props.appendChild(newAttr.dom);
			this.component.resizePanelWrap();
		};
		/**
		* Add option to options panel
		*/
		addOption = () => {
			const controlId = this.component.data.config.controlId;
			const fieldOptionData = this.component.get("options");
			const type = controlId === "select" ? "option" : controlId;
			const newOptionLabel = s.get("newOptionLabel", { type }) || "New Option";
			const itemKey = `${this.name}[${this.data.length}]`;
			const lastOptionData = fieldOptionData[fieldOptionData.length - 1];
			const itemData = {
				...fieldOptionData.length ? lastOptionData : {},
				label: newOptionLabel
			};
			if (controlId !== "button") itemData.value = slugify(newOptionLabel);
			const newOption = new EditPanelItem({
				key: itemKey,
				data: itemData,
				field: this.component,
				index: this.props.children.length,
				panel: this
			});
			this.editPanelItems.push(newOption);
			this.props.appendChild(newOption.dom);
			this.component.debouncedUpdatePreview();
			this.component.resizePanelWrap();
		};
		addCondition = (evt) => {
			const itemKey = `conditions[${this.component.get("conditions").length}]`;
			const newCondition = new EditPanelItem({
				key: itemKey,
				data: evt.template,
				field: this.component,
				panel: this
			});
			this.props.appendChild(newCondition.dom);
			this.component.set(itemKey, evt.template);
			this.component.resizePanelWrap();
		};
		addConfiguration = () => {
			const configData = this.component.get("config");
			new Dialog({
				className: "config-item-dialog",
				content: [{
					tag: "select",
					config: { label: s.get("selectConfigKey") || "Select Configuration Key" },
					attrs: {
						name: "selectConfigKey",
						required: true,
						className: "config-key-select"
					},
					options: defaultConfigOptions.filter((opt) => !(opt.value in configData))
				}],
				onConfirm: (formData) => {
					const configKey = formData.get("selectConfigKey").trim();
					const itemKey = `config.${configKey}`;
					if (configKey) {
						const newConfig = new EditPanelItem({
							key: itemKey,
							data: defaultConfigValues[configKey],
							field: this.component,
							panel: this
						});
						this.editPanelItems.push(newConfig);
						this.props.appendChild(newConfig.dom);
						this.component.debouncedUpdatePreview();
						this.component.resizePanelWrap();
					}
				}
			}).open();
		};
		/**
		* Clears all items from the component property based on its type.
		* Sets the property to an empty array for 'array' type or empty object for other types.
		* Executes removal action hooks and dispatches a custom removal event.
		*
		* @method clearAllItems
		* @fires CustomEvent#onRemove{PropertyName} - Dispatched when items are cleared
		* @returns {void}
		*/
		clearAllItems = () => {
			const emptyValue = this.type === "array" ? [] : {};
			const removeEvt = {
				type: this.name,
				removeAction: () => {
					this.component.set(this.name, emptyValue);
					this.updateProps();
				}
			};
			actions.remove[this.name](removeEvt);
			const eventType = toTitleCase(this.name);
			const customEvt = new globalThis.CustomEvent(`onRemove${eventType}`, { detail: removeEvt });
			document.dispatchEvent(customEvt);
		};
		setData(val) {
			this.data = val;
			this.component.set(this.name, val);
			this.updateProps();
		}
	};
}));
//#endregion
//#region src/lib/js/components/panels.js
var defaults$2, getTransition, Panels;
var init_panels = __esmMin((() => {
	init_i18n_es_min();
	init_sortable_esm();
	init_dom();
	init_helpers$2();
	init_utils();
	init_constants();
	defaults$2 = Object.freeze({
		type: "field",
		displayType: "slider"
	});
	getTransition = (val) => {
		return { transform: `translateX(${val ? `${val}px` : 0})` };
	};
	Panels = class {
		/**
		* Panels initial setup
		* @param  {Object} options Panels config
		* @return {Object} Panels
		*/
		constructor(options) {
			this.opts = merge(defaults$2, options);
			this.panelDisplay = this.opts.displayType;
			this.activePanelIndex = 0;
			this.panelNav = this.createPanelNav();
			const panelsWrap = this.createPanelsWrap();
			this.nav = this.navActions();
			this.nav.groupChange(this.activePanelIndex);
			const resizeObserver = new window.ResizeObserver(([{ contentRect: { width } }]) => {
				if (this.currentWidth !== width) {
					this.toggleTabbedLayout();
					this.currentWidth = width;
					this.nav.setTranslateX(this.activePanelIndex, false);
				}
			});
			const observeTimeout = window.setTimeout(() => {
				resizeObserver.observe(panelsWrap);
				window.clearTimeout(observeTimeout);
			}, ANIMATION_SPEED_SLOW);
		}
		getPanelDisplay() {
			const column = this.panelsWrap;
			const autoDisplayType = Number.parseInt(dom.getStyle(column, "width"), 10) > 390 ? "tabbed" : "slider";
			const isAuto = this.opts.displayType === "auto";
			this.panelDisplay = isAuto ? autoDisplayType : this.opts.displayType || defaults$2.displayType;
			return this.panelDisplay;
		}
		toggleTabbedLayout = () => {
			this.getPanelDisplay();
			const isTabbed = this.isTabbed;
			this.panelsWrap.parentElement?.classList.toggle("tabbed-panels", isTabbed);
			if (isTabbed) this.panelNav.removeAttribute("style");
			return isTabbed;
		};
		/**
		* Resize the panel after its contents change in height
		* @return {String} panel's height in pixels
		*/
		resizePanels = () => {
			this.toggleTabbedLayout();
		};
		/**
		* Wrap a panel and make properties sortable
		* if the panel belongs to a field
		* @return {Object} DOM element
		*/
		createPanelsWrap() {
			const panelsWrap = dom.create({
				className: "panels",
				content: this.opts.panels.map(({ config: _config, ...panel }) => panel)
			});
			if (this.opts.type === "field") this.sortableProperties(panelsWrap);
			this.panelsWrap = panelsWrap;
			this.panels = panelsWrap.children;
			this.currentPanel = this.panels[this.activePanelIndex];
			return panelsWrap;
		}
		/**
		* Sortable panel properties
		* @param  {Array} panels
		* @return {Array} panel groups
		*/
		sortableProperties(panels) {
			const groups = panels.getElementsByClassName("field-edit-group");
			return helpers.forEach(groups, (group) => {
				group.fieldId = this.opts.id;
				if (group.isSortable) Sortable.create(group, {
					animation: 150,
					group: {
						name: `edit-${group.editGroup}`,
						pull: true,
						put: ["properties"]
					},
					sort: true,
					handle: ".prop-order",
					onSort: (evt) => {
						this.propertySave(evt.to);
						this.resizePanels();
					}
				});
			});
		}
		createPanelNavLabels() {
			const labels = this.opts.panels.map((panel) => ({
				tag: "h5",
				action: { click: (evt) => {
					const index = indexOfNode(evt.target);
					this.nav.setTranslateX(index, false);
					this.nav.groupChange(index);
				} },
				content: panel.config.label
			}));
			const panelLabels = {
				className: "panel-labels",
				content: { content: labels }
			};
			const [firstLabel] = labels;
			firstLabel.className = "active-tab";
			return dom.create(panelLabels);
		}
		/**
		* Panel navigation, tabs and arrow buttons for slider
		* @return {Object} DOM object for panel navigation wrapper
		*/
		createPanelNav() {
			this.labels = this.createPanelNavLabels();
			const next = {
				tag: "button",
				attrs: {
					className: "next-group",
					title: s.get("controlGroups.nextGroup"),
					type: "button"
				},
				action: { click: (e) => this.nav.nextGroup(e) },
				content: dom.icon("triangle-right")
			};
			const prev = {
				tag: "button",
				attrs: {
					className: "prev-group",
					title: s.get("controlGroups.prevGroup"),
					type: "button"
				},
				action: { click: (e) => this.nav.prevGroup(e) },
				content: dom.icon("triangle-left")
			};
			return dom.create({
				tag: "nav",
				attrs: { className: "panel-nav" },
				content: [
					prev,
					this.labels,
					next
				]
			});
		}
		get isTabbed() {
			return this.panelDisplay === "tabbed";
		}
		/**
		* Handlers for navigating between panel groups
		* @todo refactor to use requestAnimationFrame instead of css transitions
		* @return {Object} actions that control panel groups
		*/
		navActions() {
			const action = {};
			const groupParent = this.currentPanel.parentElement;
			const labelWrap = this.labels.firstChild;
			const panelTabs = labelWrap.children;
			const siblingGroups = this.currentPanel.parentElement.childNodes;
			this.activePanelIndex = indexOfNode(this.currentPanel);
			let offset = {
				nav: 0,
				panel: 0
			};
			let lastOffset = { ...offset };
			action.groupChange = (newIndex) => {
				this.activePanelIndex = newIndex;
				this.currentPanel = siblingGroups[newIndex];
				dom.removeClasses(siblingGroups, "active-panel");
				dom.removeClasses(panelTabs, "active-tab");
				this.currentPanel.classList.add("active-panel");
				panelTabs[newIndex].classList.add("active-tab");
				return this.currentPanel;
			};
			const getOffset = (index) => {
				return {
					nav: -labelWrap.offsetWidth * index,
					panel: -groupParent.offsetWidth * index
				};
			};
			const translateX = ({ offset, reset, duration = ANIMATION_SPEED_FAST, animate = !this.isTabbed }) => {
				const panelQueue = [getTransition(lastOffset.panel), getTransition(offset.panel)];
				const navQueue = [getTransition(lastOffset.nav), getTransition(this.isTabbed ? 0 : offset.nav)];
				if (reset) {
					const [panelStart] = panelQueue;
					const [navStart] = navQueue;
					panelQueue.push(panelStart);
					navQueue.push(navStart);
				}
				const animationOptions = {
					easing: "ease-in-out",
					duration: animate ? duration : 0,
					fill: "forwards"
				};
				const panelTransition = groupParent.animate(panelQueue, animationOptions);
				labelWrap.animate(navQueue, animationOptions);
				const handleFinish = () => {
					panelTransition.removeEventListener("finish", handleFinish);
					if (!reset) lastOffset = offset;
				};
				panelTransition.addEventListener("finish", handleFinish);
			};
			action.setTranslateX = (panelIndex = this.activePanelIndex, animate = true) => {
				offset = getOffset(panelIndex);
				translateX({
					offset,
					animate
				});
			};
			action.refresh = (newIndex = this.activePanelIndex) => {
				if (this.activePanelIndex !== newIndex) action.groupChange(newIndex);
				action.setTranslateX(this.activePanelIndex, false);
				this.resizePanels();
			};
			/**
			* Slides panel to the next group
			* @return {Object} current group after navigation
			*/
			action.nextGroup = () => {
				const newIndex = this.activePanelIndex + 1;
				if (newIndex !== siblingGroups.length) {
					const nextPanel = siblingGroups[newIndex];
					offset = {
						nav: -labelWrap.offsetWidth * newIndex,
						panel: -nextPanel.offsetLeft
					};
					translateX({ offset });
					action.groupChange(newIndex);
				} else {
					offset = {
						nav: lastOffset.nav - 8,
						panel: lastOffset.panel - 8
					};
					translateX({
						offset,
						reset: true
					});
				}
				return this.currentPanel;
			};
			action.prevGroup = () => {
				if (this.activePanelIndex !== 0) {
					const newIndex = this.activePanelIndex - 1;
					const prevPanel = siblingGroups[newIndex];
					offset = {
						nav: -labelWrap.offsetWidth * newIndex,
						panel: -prevPanel.offsetLeft
					};
					translateX({ offset });
					action.groupChange(newIndex);
				} else {
					offset = {
						nav: 8,
						panel: 8
					};
					translateX({
						offset,
						reset: true
					});
				}
			};
			return action;
		}
	};
}));
//#endregion
//#region src/lib/js/components/rows/row.js
var DEFAULT_DATA$2, Row;
var init_row$1 = __esmMin((() => {
	init_i18n_es_min();
	init_sortable_esm();
	init_dom();
	init_events();
	init_utils();
	init_constants();
	init_component();
	DEFAULT_DATA$2 = () => Object.freeze({
		config: {
			fieldset: false,
			legend: "",
			inputGroup: false
		},
		children: [],
		className: [ROW_CLASSNAME]
	});
	Row = class extends Component {
		/**
		* Set default and generate dom for row in editor
		* @param  {String} dataID
		* @return {Object}
		*/
		constructor(rowData) {
			super("row", {
				...DEFAULT_DATA$2(),
				...rowData
			});
			const children = this.createChildWrap();
			this.dom = dom.create({
				tag: "li",
				className: [ROW_CLASSNAME, "empty"],
				dataset: {
					hoverTag: s.get("row"),
					editingHoverTag: s.get("editing.row")
				},
				id: this.id,
				content: [
					this.getComponentTag(),
					this.getActionButtons(),
					this.editWindow,
					children
				]
			});
			Sortable.create(children, {
				animation: 150,
				fallbackClass: "column-moving",
				forceFallback: true,
				group: {
					name: "row",
					pull: true,
					put: [
						"row",
						"column",
						"controls"
					]
				},
				sort: true,
				disabled: false,
				onRemove: this.onRemove.bind(this),
				onEnd: this.onEnd.bind(this),
				onAdd: this.onAdd.bind(this),
				onSort: this.onSort.bind(this),
				draggable: `.${COLUMN_CLASSNAME}`,
				handle: ".item-move"
			});
		}
		/**
		* Edit window for Row
		* @return {Object} edit window dom config for Row
		*/
		get editWindow() {
			const fieldsetInput = {
				tag: "input",
				id: `${this.id}-fieldset`,
				attrs: {
					type: "checkbox",
					checked: this.get("config.fieldset"),
					ariaLabel: s.get("row.settings.fieldsetWrap.aria")
				},
				action: { click: ({ target: { checked } }) => {
					this.set("config.fieldset", Boolean(checked));
				} },
				config: { label: s.get("row.settings.fieldsetWrap") }
			};
			const inputGroupInput = {
				tag: "input",
				id: `${this.id}-inputGroup`,
				attrs: {
					type: "checkbox",
					checked: this.get("config.inputGroup"),
					ariaLabel: s.get("row.settings.inputGroup.aria")
				},
				action: { click: ({ target: { checked } }) => this.set("config.inputGroup", checked) },
				config: {
					label: s.get("row.makeInputGroup"),
					description: s.get("row.makeInputGroupDesc")
				}
			};
			const fieldsetInputGroup = {
				className: "input-group",
				content: {
					tag: "input",
					attrs: {
						type: "text",
						ariaLabel: "Legend for fieldset",
						value: this.get("config.legend"),
						placeholder: "Title"
					},
					config: { label: { children: ["Row Title", {
						tag: "span",
						content: " ⓘ",
						dataset: { tooltip: "Row title will be used as the legend for the fieldset" }
					}] } },
					action: { input: ({ target: { value } }) => this.set("config.legend", value) },
					className: ""
				}
			};
			const fieldSetControls = dom.formGroup([fieldsetInput, fieldsetInputGroup]);
			const columnSettingsPresetLabel = {
				tag: "label",
				content: s.get("defineColumnWidths"),
				className: "col-sm-4 form-control-label"
			};
			this.columnPresetControl = dom.create(this.columnPresetControlConfig);
			const columnSettingsPresetSelect = {
				className: "col-sm-8",
				content: this.columnPresetControl,
				action: { onRender: () => {
					this.updateColumnPreset();
				} }
			};
			const editWindowContents = [
				inputGroupInput,
				"hr",
				fieldSetControls,
				"hr",
				dom.formGroup([columnSettingsPresetLabel, columnSettingsPresetSelect], "row")
			];
			return dom.create({
				className: `${this.name}-edit group-config`,
				action: { onRender: (editWindow) => {
					const elements = editWindowContents.map((elem) => dom.create(elem));
					editWindow.append(...elements);
				} }
			});
		}
		onAdd(...args) {
			super.onAdd(...args);
			this.autoColumnWidths();
		}
		onRemove(...args) {
			super.onRemove(...args);
			this.autoColumnWidths();
		}
		/**
		* Read columns and generate bootstrap cols
		* @param {Object} row DOM element
		*/
		autoColumnWidths = () => {
			const columns = this.children;
			if (!columns.length) return;
			const width = Number.parseFloat((100 / columns.length).toFixed(1)) / 1;
			for (const column of columns) {
				column.removeClasses(bsColRegExp);
				const colDom = column.dom;
				const newColWidth = numToPercent(width);
				column.set("config.width", newColWidth);
				colDom.style.width = newColWidth;
				colDom.dataset.colWidth = newColWidth;
				const refreshTimeout = setTimeout(() => {
					clearTimeout(refreshTimeout);
					column.refreshFieldPanels();
				}, ANIMATION_SPEED_FAST);
				document.dispatchEvent(events.columnResized);
			}
			this.updateColumnPreset();
		};
		/**
		* Updates the column preset <select>
		* @return {Object} columnPresetConfig
		*/
		updateColumnPreset = () => {
			this.columnPresetControl.innerHTML = "";
			const presetOptions = this.getColumnPresetOptions.map(({ label, ...attrs }) => dom.create({
				tag: "option",
				content: label,
				attrs
			}));
			this.columnPresetControl.append(...presetOptions);
		};
		/**
		* Set the widths of columns in a row
		* @param {Object} row DOM element
		* @param {String} widths
		*/
		setColumnWidths = (widths) => {
			if (typeof widths === "string") widths = widths.split(",");
			this.children.forEach((column, i) => {
				column.setWidth(`${widths[i]}%`);
				column.refreshFieldPanels();
			});
		};
		/**
		* Retrieves the preset options for columns based on the current configuration.
		*
		* @returns {Array<Object>} An array of option objects for column presets. Each object contains:
		* - `value` {string}: The comma-separated string of column widths.
		* - `label` {string}: The display label for the option, with widths separated by ' | '.
		* - `className` {string}: The CSS class name for custom column options.
		* - `selected` {boolean} [optional]: Indicates if the option is the current value.
		*/
		get getColumnPresetOptions() {
			const columns = this.children;
			const pMapVal = COLUMN_TEMPLATES.get(columns.length - 1) || [];
			const curVal = columns.map((Column) => {
				const width = Column.get("config.width") || "";
				return Number(width.replace("%", "")).toFixed(1);
			}).join(",");
			if (pMapVal.length) {
				const options = pMapVal.slice();
				if (!options.find((val) => val.value === curVal)) options.push({
					value: curVal,
					label: curVal.replace(/,/g, " | "),
					className: CUSTOM_COLUMN_OPTION_CLASSNAME
				});
				return options.map((val) => {
					const option = { ...val };
					option.selected = val.value === curVal;
					return option;
				});
			}
			return [];
		}
		/**
		* Generates the element config for column layout in row
		* @return {Object} columnPresetControlConfig
		*/
		get columnPresetControlConfig() {
			return {
				tag: "select",
				attrs: {
					ariaLabel: s.get("defineColumnLayout"),
					className: COLUMN_PRESET_CLASSNAME
				},
				action: { change: ({ target }) => {
					const { value } = target;
					this.setColumnWidths(value);
				} },
				options: this.getColumnPresetOptions
			};
		}
	};
}));
//#endregion
//#region src/lib/js/components/rows/index.js
var DEFAULT_CONFIG$3, Rows$1, rows;
var init_rows = __esmMin((() => {
	init_component_data();
	init_row$1();
	DEFAULT_CONFIG$3 = { actionButtons: {
		buttons: [
			"move",
			"edit",
			"clone",
			"remove"
		],
		disabled: []
	} };
	Rows$1 = class extends ComponentData {
		constructor(rowData) {
			super("rows", rowData);
			this.config = { all: DEFAULT_CONFIG$3 };
		}
		Component(data) {
			return new Row(data);
		}
	};
	rows = new Rows$1();
}));
//#endregion
//#region src/lib/js/components/stages/stage.js
var DEFAULT_DATA$1, Stage;
var init_stage = __esmMin((() => {
	init_i18n_es_min();
	init_sortable_esm();
	init_animation();
	init_dom();
	init_utils();
	init_constants();
	init_component();
	init_stages();
	DEFAULT_DATA$1 = () => ({
		conditions: [CONDITION_TEMPLATE()],
		children: []
	});
	Stage = class extends Component {
		/**
		* Process options and load existing fields from data to the stage
		* @param  {Object} formeoOptions
		* @param  {String} stageData uuid
		* @return {Object} DOM element
		*/
		constructor(stageData) {
			super("stage", {
				...DEFAULT_DATA$1(),
				...stageData
			});
			this.updateEditPanels();
			this.debouncedUpdateEditPanels = debounce(this.updateEditPanels);
			s.get("Untitled Form"), s.get("Untitled Form"), s.get("Form Title"), s.get("Form novalidate"), s.get("Tags");
			const children = this.createChildWrap();
			this.dom = dom.create({
				attrs: {
					className: [STAGE_CLASSNAME, "empty"],
					id: this.id
				},
				children: [
					this.getComponentTag(),
					this.getActionButtons(),
					this.editWindow,
					children
				]
			});
			Sortable.create(children, {
				animation: 150,
				fallbackClass: "row-moving",
				group: {
					name: "stage",
					pull: true,
					put: [
						"row",
						"column",
						"controls"
					]
				},
				sort: true,
				disabled: false,
				onAdd: this.onAdd.bind(this),
				onRemove: this.onRemove.bind(this),
				onStart: () => {
					stages.active = this;
				},
				onSort: this.onSort.bind(this),
				draggable: `.${ROW_CLASSNAME}`,
				handle: ".item-move"
			});
		}
		empty(isAnimated = true) {
			return new Promise((resolve) => {
				if (isAnimated) {
					this.dom.classList.add("removing-all-fields");
					animate.slideUp(this.dom, 333, () => {
						resolve(super.empty(isAnimated));
						this.dom.classList.remove("removing-all-fields");
						animate.slideDown(this.dom, 333);
					});
				} else resolve(super.empty());
			});
		}
		onAdd(...args) {
			const component = super.onAdd(...args);
			if (component?.name === "column") component.parent.autoColumnWidths();
		}
	};
}));
//#endregion
//#region src/lib/js/components/stages/index.js
var DEFAULT_CONFIG$2, Stages$1, stages;
var init_stages = __esmMin((() => {
	init_component_data();
	init_stage();
	DEFAULT_CONFIG$2 = () => ({
		actionButtons: {
			buttons: ["edit"],
			disabled: []
		},
		panels: {
			disabled: [],
			order: [
				"attrs",
				"options",
				"conditions"
			]
		}
	});
	Stages$1 = class extends ComponentData {
		constructor(stageData) {
			super("stages", stageData);
			this.config = { all: DEFAULT_CONFIG$2() };
		}
		Component(data) {
			return new Stage(data);
		}
	};
	stages = new Stages$1();
}));
//#endregion
//#region src/lib/js/components/controls/control.js
var Control;
var init_control = __esmMin((() => {
	init_i18n_es_min();
	init_dom();
	init_helpers$2();
	init_loaders();
	init_utils();
	init_constants();
	init_controls();
	Control = class {
		controlCache = /* @__PURE__ */ new Set();
		/**
		* Constructs a new Control instance.
		*
		* @param {Object} [config={}] - The configuration object.
		* @param {Object} [config.events={}] - The events associated with the control. ex { click: () => {} }
		* @param {Object} [config.dependencies={}] - The dependencies required by the control. ex { js: 'https://example.com/script.js', css: 'https://example.com/style.css' }
		* @param {...Object} [controlData] - Additional configuration properties. ex { meta: {}, config: { label: 'Control Name' } }
		*/
		constructor({ events = {}, dependencies = {}, controlAction, ...controlData }) {
			this.events = events;
			this.controlData = controlData;
			this.controlAction = controlAction;
			this.dependencies = dependencies;
			this.id = controlData.id || uuid();
		}
		get controlId() {
			return this.controlData.meta?.id || this.controlData.config?.controlId;
		}
		get dom() {
			const { meta, config } = this.controlData;
			const controlLabel = this.i18n(config.label) || config.label;
			const button = {
				tag: "button",
				attrs: { type: "button" },
				content: [{
					tag: "span",
					className: "control-icon",
					children: dom.icon(meta.icon)
				}, {
					tag: "span",
					className: "control-label",
					content: controlLabel
				}],
				action: {
					focus: ({ target }) => {
						const group = target.closest(`.${CONTROL_GROUP_CLASSNAME}`);
						return group && controls_default.panels.nav.refresh(indexOfNode(group));
					},
					click: ({ target }) => {
						const controlId = target.closest(".field-control")?.id;
						if (controlId) controls_default.addElement(controlId);
					}
				}
			};
			return dom.create({
				tag: "li",
				id: this.id,
				className: [
					"field-control",
					`${meta.group}-control`,
					`${meta.id}-control`
				],
				content: button,
				meta,
				action: this.controlAction
			});
		}
		promise() {
			return fetchDependencies(this.dependencies);
		}
		/**
		* Retrieve a translated string
		* By default looks for translations defined against the class (for plugin controls)
		* Expects {locale1: {type: label}, locale2: {type: label}}, or {default: label}, or {local1: label, local2: label2}
		* @param {String} lookup string to retrieve the label / translated string for
		* @param {Object|Number|String} args - string or key/val pairs for string lookups with variables
		* @return {String} the translated label
		*/
		i18n(lookup, args) {
			const locale = s.locale;
			const localeTranslations = (this.definition?.i18n)?.[locale] || {};
			return (localeTranslations[lookup]?.() ?? localeTranslations[lookup]) || s.get(lookup, args);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/options.js
var defaultOptions;
var init_options = __esmMin((() => {
	defaultOptions = Object.freeze({
		sortable: true,
		elementOrder: {},
		groupOrder: [],
		groups: [
			{
				id: "layout",
				label: "controls.groups.layout",
				elementOrder: ["row", "column"]
			},
			{
				id: "common",
				label: "controls.groups.form",
				elementOrder: ["button", "checkbox"]
			},
			{
				id: "html",
				label: "controls.groups.html",
				elementOrder: ["header", "block-text"]
			}
		],
		disable: {
			groups: [],
			elements: [],
			formActions: []
		},
		elements: [],
		container: null,
		panels: { displayType: "slider" }
	});
}));
//#endregion
//#region src/lib/js/components/fields/field.js
var field_exports = /* @__PURE__ */ __exportAll({ default: () => Field });
var checkableTypes, isSelectableType, Field;
var init_field = __esmMin((() => {
	init_i18n_es_min();
	init_dom();
	init_helpers$2();
	init_utils();
	init_constants();
	init_component();
	checkableTypes = new Set(["checkbox", "radio"]);
	isSelectableType = new Set([
		"radio",
		"checkbox",
		"select-one",
		"select-multiple"
	]);
	Field = class extends Component {
		/**
		* Set defaults and load fieldData
		* @param  {Object} fieldData existing field ID
		* @return {Object} field object
		*/
		constructor(fieldData = Object.create(null)) {
			super("field", fieldData);
			this.debouncedUpdateEditPanels = debounce(this.updateEditPanels);
			this.debouncedUpdatePreview = debounce(this.updatePreview);
			this.label = dom.create(this.labelConfig);
			this.preview = this.fieldPreview();
			this.controlId = this.get("config.controlId") || this.get("meta.id");
			const actionButtons = this.getActionButtons();
			const hasEditButton = this.actionButtons.some((child) => child.meta?.id === "edit");
			this.updateEditPanels();
			const field = dom.create({
				tag: "li",
				attrs: { className: FIELD_CLASSNAME },
				id: this.id,
				children: [
					this.label,
					this.getComponentTag(),
					actionButtons,
					hasEditButton && this.editWindow,
					this.preview
				].filter(Boolean),
				panelNav: this.panelNav,
				dataset: { hoverTag: s.get("field") }
			});
			this.dom = field;
			this.isEditing = false;
		}
		get labelConfig() {
			if (!!this.get("config.hideLabel")) return null;
			const { label, editorLabel, disableHtmlLabel, helpText, tooltip } = this.get("config");
			const { required: isRequired } = this.get("attrs") || {};
			const labelVal = editorLabel || label;
			const labelBase = {
				tag: "label",
				attrs: {}
			};
			if (disableHtmlLabel) {
				labelBase.tag = "input";
				labelBase.attrs.value = labelVal;
			} else {
				labelBase.attrs.contenteditable = true;
				labelBase.children = labelVal;
			}
			return {
				className: "prev-label",
				children: [
					{
						...labelBase,
						action: { input: ({ target: { innerHTML, value } }) => {
							const labelVal = disableHtmlLabel ? value : innerHTML;
							super.set("config.label", labelVal);
							const configPanelLabelInput = this.dom.querySelector(".config-label");
							if (configPanelLabelInput) configPanelLabelInput.value = labelVal;
						} }
					},
					isRequired && dom.requiredMark(),
					tooltip && dom.tooltip(tooltip),
					helpText && dom.helpText(helpText)
				]
			};
		}
		setData = (path, value) => {
			return super.set(path, value);
		};
		/**
		* wrapper for Data.set
		*/
		set(path, value) {
			return this.setData(path, value);
		}
		/**
		* Update the label dom when label data changes
		*/
		updateLabel() {
			const newLabel = dom.create(this.labelConfig);
			if (this.label || !newLabel) this.label.remove();
			if (newLabel) if (this.data.config?.labelAfter) this.dom.append(newLabel);
			else this.dom.prepend(newLabel);
			this.label = newLabel;
		}
		/**
		* Updates a field's preview
		* @return {Object} fresh preview
		*/
		updatePreview = () => {
			this.updateLabel();
			const newPreview = this.fieldPreview();
			this.preview.replaceWith(newPreview);
			this.preview = newPreview;
		};
		get defaultPreviewActions() {
			return {
				change: (evt) => {
					const { target } = evt;
					const { type } = target;
					if (isSelectableType.has(type)) {
						const selectedOptions = this.preview.querySelectorAll(":checked");
						const optionsData = this.get("options");
						const checkedType = optionsData?.[0]?.selected === void 0 ? "checked" : "selected";
						const optionsDataMap = optionsData.reduce((acc, option) => {
							acc[option.value] = option;
							acc[option.value][checkedType] = false;
							return acc;
						}, {});
						for (const option of selectedOptions) optionsDataMap[option.value][checkedType] = option.value === optionsDataMap[option.value].value;
						super.set("options", Object.values(optionsDataMap));
						return this.debouncedUpdateEditPanels();
					}
				},
				click: (evt) => {
					if (evt.target.contentEditable === "true") evt.preventDefault();
				},
				input: ({ target }) => {
					if ([
						"input",
						"meter",
						"progress",
						"button"
					].includes(target.tagName.toLowerCase())) {
						super.set("attrs.value", target.value);
						return this.debouncedUpdateEditPanels();
					}
					if (target.contentEditable && !target.type?.startsWith("select-")) {
						const parentClassList = target.parentElement.classList;
						if (parentClassList.contains("f-checkbox") || parentClassList.contains("f-radio")) {
							const option = target.parentElement;
							const optionIndex = indexOfNode(option);
							this.setData(`options[${optionIndex}].label`, target.innerHTML);
							return this.debouncedUpdateEditPanels();
						}
						this.setData("content", target.innerHTML || target.value);
					}
				}
			};
		}
		/**
		* Generate field preview config
		* @return {Object} fieldPreview
		*/
		fieldPreview() {
			const { action = {}, ...prevData } = clone$1(this.data);
			prevData.id = `prev-${this.id}`;
			prevData.action = Object.entries(action).reduce((acc, [key, value]) => {
				acc[key] = value.bind(this);
				return acc;
			}, {});
			if (this.data?.config.editableContent) prevData.attrs = {
				...prevData.attrs,
				contenteditable: true
			};
			const fieldPreview = {
				attrs: {
					className: "field-preview",
					style: this.isEditing && "display: none;"
				},
				content: dom.create(prevData, true),
				action: this.defaultPreviewActions
			};
			return dom.create(fieldPreview, true);
		}
		get isCheckable() {
			return checkableTypes.has(this.get("config.controlId"));
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/layout/column.js
var columnControl;
var init_column$1 = __esmMin((() => {
	columnControl = {
		config: { label: "column" },
		meta: {
			group: "layout",
			icon: "columns",
			id: "layout-column"
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/layout/row.js
var rowControl;
var init_row = __esmMin((() => {
	rowControl = {
		config: { label: "row" },
		meta: {
			group: "layout",
			icon: "rows",
			id: "layout-row"
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/layout/index.js
var layout_exports = /* @__PURE__ */ __exportAll({ default: () => layout_default });
var layout_default;
var init_layout = __esmMin((() => {
	init_column$1();
	init_row();
	layout_default = [rowControl, columnControl];
}));
//#endregion
//#region src/lib/js/components/controls/form/button.js
var buttonTypes, ButtonControl;
var init_button = __esmMin((() => {
	init_i18n_es_min();
	init_utils();
	init_control();
	buttonTypes = [
		"button",
		"submit",
		"reset"
	].map((buttonType) => ({
		label: buttonType,
		value: buttonType
	}));
	buttonTypes[0].selected = true;
	ButtonControl = class extends Control {
		constructor(controlConfig = {}) {
			const mergedConfig = merge({
				tag: "button",
				attrs: { className: [{
					label: "grouped",
					value: "f-btn-group"
				}, {
					label: "ungrouped",
					value: "f-field-group"
				}] },
				config: {
					label: s.get("controls.form.button"),
					hideLabel: true
				},
				meta: {
					group: "common",
					icon: "button",
					id: "button"
				},
				options: [{
					label: s.get("button"),
					type: buttonTypes,
					className: [
						{
							label: "default",
							value: "",
							selected: true
						},
						{
							label: "primary",
							value: "primary"
						},
						{
							label: "danger",
							value: "error"
						},
						{
							label: "success",
							value: "success"
						},
						{
							label: "warning",
							value: "warning"
						}
					]
				}]
			}, controlConfig);
			super(mergedConfig);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/form/shared.js
var generateOptionConfig;
var init_shared = __esmMin((() => {
	init_i18n_es_min();
	init_string();
	generateOptionConfig = ({ type, isMultiple = false, count = 3 }) => Array.from({ length: count }, (_v, k) => k + 1).map((i) => {
		const selectedKey = type === "checkbox" || isMultiple ? "checked" : "selected";
		return {
			label: s.get("labelCount", {
				label: toTitleCase(type),
				count: i
			}),
			value: `${type}-${i}`,
			[selectedKey]: !i
		};
	});
}));
//#endregion
//#region src/lib/js/components/controls/form/checkbox-group.js
var CheckboxGroupControl;
var init_checkbox_group = __esmMin((() => {
	init_i18n_es_min();
	init_control();
	init_shared();
	CheckboxGroupControl = class extends Control {
		constructor() {
			const checkboxGroup = {
				tag: "input",
				attrs: {
					type: "checkbox",
					required: false
				},
				config: {
					label: s.get("controls.form.checkbox-group"),
					disabledAttrs: ["type"]
				},
				meta: {
					group: "common",
					icon: "checkbox",
					id: "checkbox"
				},
				options: generateOptionConfig({
					type: "checkbox",
					count: 1
				})
			};
			super(checkboxGroup);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/form/input.date.js
var DateControl;
var init_input_date = __esmMin((() => {
	init_i18n_es_min();
	init_control();
	DateControl = class extends Control {
		constructor() {
			const dateInput = {
				tag: "input",
				attrs: {
					type: "date",
					required: false,
					className: ""
				},
				config: { label: s.get("controls.form.input.date") },
				meta: {
					group: "common",
					icon: "calendar",
					id: "date-input"
				}
			};
			super(dateInput);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/form/input.file.js
var FileControl;
var init_input_file = __esmMin((() => {
	init_i18n_es_min();
	init_control();
	FileControl = class extends Control {
		constructor() {
			const fileInput = {
				tag: "input",
				attrs: {
					type: "file",
					required: false
				},
				config: { label: s.get("fileUpload") },
				meta: {
					group: "common",
					icon: "upload",
					id: "upload"
				}
			};
			super(fileInput);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/form/input.hidden.js
var HiddenControl;
var init_input_hidden = __esmMin((() => {
	init_i18n_es_min();
	init_control();
	HiddenControl = class extends Control {
		constructor() {
			const hiddenInput = {
				tag: "input",
				attrs: {
					type: "hidden",
					value: ""
				},
				config: {
					label: s.get("hidden"),
					hideLabel: true
				},
				meta: {
					group: "common",
					icon: "hidden",
					id: "hidden"
				}
			};
			super(hiddenInput);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/form/input.number.js
var NumberControl;
var init_input_number = __esmMin((() => {
	init_i18n_es_min();
	init_control();
	NumberControl = class extends Control {
		constructor() {
			const numberInput = {
				tag: "input",
				attrs: {
					type: "number",
					required: false,
					className: ""
				},
				config: { label: s.get("number") },
				meta: {
					group: "common",
					icon: "hash",
					id: "number"
				}
			};
			super(numberInput);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/form/input.text.js
var TextControl;
var init_input_text = __esmMin((() => {
	init_i18n_es_min();
	init_control();
	TextControl = class extends Control {
		constructor() {
			const textInput = {
				tag: "input",
				attrs: {
					required: false,
					type: "text",
					className: ""
				},
				config: {
					label: s.get("controls.form.input.text"),
					hideLabel: false
				},
				meta: {
					group: "common",
					icon: "text-input",
					id: "text-input"
				}
			};
			super(textInput);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/form/radio-group.js
var RadioGroupControl;
var init_radio_group = __esmMin((() => {
	init_i18n_es_min();
	init_control();
	init_shared();
	RadioGroupControl = class extends Control {
		constructor() {
			const radioGroup = {
				tag: "input",
				attrs: {
					type: "radio",
					required: false
				},
				config: {
					label: s.get("controls.form.radio-group"),
					disabled: ["attrs.type"]
				},
				meta: {
					group: "common",
					icon: "radio-group",
					id: "radio"
				},
				options: generateOptionConfig({ type: "radio" })
			};
			super(radioGroup);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/form/select.js
var SelectControl;
var init_select = __esmMin((() => {
	init_i18n_es_min();
	init_utils();
	init_control();
	init_shared();
	SelectControl = class extends Control {
		constructor(controlConfig = {}) {
			const mergedConfig = merge({
				tag: "select",
				config: { label: s.get("controls.form.select") },
				attrs: {
					required: false,
					className: "",
					multiple: false
				},
				meta: {
					group: "common",
					icon: "select",
					id: "select"
				},
				options: generateOptionConfig({
					type: "option",
					isMultiple: controlConfig.attrs?.multiple
				})
			}, controlConfig);
			super(mergedConfig);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/form/textarea.js
var TextAreaControl;
var init_textarea = __esmMin((() => {
	init_i18n_es_min();
	init_control();
	TextAreaControl = class extends Control {
		constructor() {
			const textAreaConfig = {
				tag: "textarea",
				config: { label: s.get("controls.form.textarea") },
				meta: {
					group: "common",
					icon: "textarea",
					id: "textarea"
				},
				attrs: { required: false }
			};
			super(textAreaConfig);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/form/index.js
var form_exports = /* @__PURE__ */ __exportAll({ default: () => form_default });
var form_default;
var init_form = __esmMin((() => {
	init_button();
	init_checkbox_group();
	init_input_date();
	init_input_file();
	init_input_hidden();
	init_input_number();
	init_input_text();
	init_radio_group();
	init_select();
	init_textarea();
	form_default = [
		ButtonControl,
		DateControl,
		HiddenControl,
		NumberControl,
		TextAreaControl,
		TextControl,
		FileControl,
		SelectControl,
		CheckboxGroupControl,
		RadioGroupControl
	];
}));
//#endregion
//#region src/lib/js/components/controls/html/header.js
var headerTags, headerKey, HeaderControl;
var init_header = __esmMin((() => {
	init_i18n_es_min();
	init_control();
	headerTags = Array.from(Array(5).keys()).slice(1).map((key) => `h${key}`);
	headerKey = "controls.html.header";
	HeaderControl = class extends Control {
		constructor() {
			const header = {
				tag: headerTags[0],
				attrs: {
					tag: headerTags.map((tag, index) => ({
						label: tag.toUpperCase(),
						value: tag,
						selected: !index
					})),
					className: ""
				},
				config: {
					label: s.get(headerKey),
					hideLabel: true,
					editableContent: true
				},
				meta: {
					group: "html",
					icon: "header",
					id: "html.header"
				},
				content: s.get(headerKey),
				action: {}
			};
			super(header);
		}
		/**
		* class configuration
		*/
		static get definition() {
			return { i18n: { "en-US": { header: "Custom English Header" } } };
		}
		get content() {
			return super.i18n(headerKey);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/html/hr.js
var HRControl;
var init_hr = __esmMin((() => {
	init_i18n_es_min();
	init_control();
	HRControl = class extends Control {
		constructor() {
			const hrConfig = {
				tag: "hr",
				config: {
					label: s.get("controls.html.divider"),
					hideLabel: true
				},
				meta: {
					group: "html",
					icon: "divider",
					id: "divider"
				}
			};
			super(hrConfig);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/html/paragraph.js
var ParagraphControl;
var init_paragraph = __esmMin((() => {
	init_i18n_es_min();
	init_control();
	ParagraphControl = class extends Control {
		constructor() {
			const paragraphConfig = {
				tag: "p",
				attrs: { className: "" },
				config: {
					label: s.get("controls.html.paragraph"),
					hideLabel: true,
					editableContent: true
				},
				meta: {
					group: "html",
					icon: "paragraph",
					id: "paragraph"
				},
				content: "Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition. Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment."
			};
			super(paragraphConfig);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/html/tinymce.js
var TinyMCEControl;
var init_tinymce = __esmMin((() => {
	init_utils();
	init_control();
	TinyMCEControl = class extends Control {
		constructor(options) {
			const mergedOptions = merge({
				tag: "textarea",
				config: {
					label: "WYSIWYG",
					editableContent: true
				},
				meta: {
					group: "html",
					icon: "rich-text",
					id: "tinymce"
				},
				attrs: { required: false },
				dependencies: { js: "https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.11/tinymce.min.js" },
				action: { onRender: (elem) => {
					const selector = `#${elem.id}`;
					window.tinymce.remove(selector);
					window.tinymce.init({ selector });
				} },
				controlAction: {
					click: () => {},
					onRender: () => {}
				}
			}, options);
			super(mergedOptions);
		}
	};
}));
//#endregion
//#region src/lib/js/components/controls/html/index.js
var html_exports = /* @__PURE__ */ __exportAll({ default: () => html_default });
var html_default;
var init_html = __esmMin((() => {
	init_header();
	init_hr();
	init_paragraph();
	init_tinymce();
	html_default = [
		HeaderControl,
		ParagraphControl,
		HRControl,
		TinyMCEControl
	];
}));
//#endregion
//#region src/lib/js/components/controls/index.js
var controls_exports = /* @__PURE__ */ __exportAll({
	Controls: () => Controls$2,
	default: () => controls_default
});
var Controls$2, controls_default;
var init_controls = __esmMin((() => {
	init_i18n_es_min();
	init_sortable_esm();
	init_actions();
	init_dom();
	init_events();
	init_helpers$2();
	init_utils();
	init_object();
	init_constants();
	init_panels();
	init_rows();
	init_stages();
	init_control();
	init_options();
	Controls$2 = class {
		constructor() {
			this.data = /* @__PURE__ */ new Map();
			this.buttonActions = {
				focus: ({ target }) => {
					const group = target.closest(`.${CONTROL_GROUP_CLASSNAME}`);
					return group && this.panels.nav.refresh(indexOfNode(group));
				},
				click: ({ target }) => {
					this.addElement(target.parentElement.id);
				}
			};
		}
		/**
		* Methods to be called on initialization
		* @param {Object} controlOptions
		*/
		async init(controlOptions, sticky = false) {
			await this.applyOptions(controlOptions);
			this.buildDOM(sticky);
			return this;
		}
		/**
		* Generate control config for UI and bind actions
		* @return {Array} elementControls
		*/
		registerControls(elements) {
			this.controls = [];
			return elements.map((Element) => {
				const control = typeof Element === "function" ? new Element() : new Control(Element);
				this.add(control);
				this.controls.push(control.dom);
				return control.promise();
			});
		}
		groupLabel = (key) => s.get(key) || key || "";
		/**
		* Group elements into their respective control group
		* @return {Array} allGroups
		*/
		groupElements() {
			let groups = this.options.groups.slice();
			let elements = this.controls.slice();
			let allGroups = [];
			const usedElementIds = [];
			groups = orderObjectsBy(groups, this.groupOrder, "id");
			groups = groups.filter((group) => match(group.id, this.options.disable.groups));
			allGroups = groups.map((group) => {
				const groupConfig = {
					tag: "ul",
					attrs: {
						className: [CONTROL_GROUP_CLASSNAME, PANEL_CLASSNAME],
						id: `${group.id}-${CONTROL_GROUP_CLASSNAME}`
					},
					config: { label: this.groupLabel(group.label) }
				};
				if (this.options.elementOrder[group.id]) {
					const userOrder = this.options.elementOrder[group.id];
					group.elementOrder = unique(userOrder.concat(group.elementOrder));
				}
				elements = orderObjectsBy(elements, group.elementOrder, "meta.id");
				/**
				* Fill control groups with their fields
				* @param  {Object} field Field configuration object.
				* @return {Array}        Filtered array of Field config objects
				*/
				groupConfig.content = elements.filter((control) => {
					const { controlData: field } = this.get(control.id);
					const controlId = field.meta.id || "";
					const filters = [
						match(controlId, this.options.disable.elements),
						field.meta.group === group.id,
						!usedElementIds.includes(controlId)
					];
					let shouldFilter = true;
					shouldFilter = filters.every((val) => val === true);
					if (shouldFilter) usedElementIds.push(controlId);
					return shouldFilter;
				});
				return groupConfig;
			});
			return allGroups;
		}
		add(control = Object.create(null)) {
			const controlConfig = clone$1(control);
			this.data.set(controlConfig.id, controlConfig);
			if (controlConfig.controlData.meta.id) this.data.set(controlConfig.controlData.meta.id, controlConfig.controlData);
			return controlConfig;
		}
		get(controlId) {
			return clone$1(this.data.get(controlId));
		}
		/**
		* Generate the DOM config for form actions like settings, save and clear
		* @return {Object} form action buttons config
		*/
		formActions() {
			if (this.options.disable.formActions === true) return null;
			const clearBtn = {
				...dom.btnTemplate({
					content: [dom.icon("bin"), s.get("clear")],
					title: s.get("clearAll")
				}),
				className: ["clear-form"],
				action: { click: (evt) => {
					if (rows.size) {
						events.confirmClearAll = new window.CustomEvent("confirmClearAll", { detail: {
							confirmationMessage: s.get("confirmClearAll"),
							clearAllAction: () => {
								stages.clearAll().then(() => {
									const evtData = { src: evt.target };
									events.formeoCleared(evtData);
								});
							},
							btnCoords: dom.coords(evt.target)
						} });
						document.dispatchEvent(events.confirmClearAll);
					} else window.alert(s.get("cannotClearFields"));
				} }
			};
			const saveBtn = {
				...dom.btnTemplate({
					content: [dom.icon("floppy-disk"), s.get("save")],
					title: s.get("save")
				}),
				className: ["save-form"],
				action: { click: async ({ target }) => {
					const { default: Components } = await Promise.resolve().then(() => (init_components(), components_exports));
					const { formData } = Components;
					const saveEvt = {
						action: () => {},
						coords: dom.coords(target),
						message: "",
						button: target
					};
					actions.click.btn(saveEvt);
					return actions.save.form(formData);
				} }
			};
			return {
				className: "form-actions f-btn-group",
				content: Object.entries({
					clearBtn,
					saveBtn
				}).reduce((acc, [key, value]) => {
					if (!this.options.disable.formActions.includes(key)) acc.push(value);
					return acc;
				}, [])
			};
		}
		/**
		* Returns the markup for the form controls/fields
		* @return {DOM}
		*/
		buildDOM(sticky) {
			const groupedFields = this.groupElements();
			const formActions = this.formActions();
			const { displayType } = this.options.panels;
			this.panels = new Panels({
				panels: groupedFields,
				type: "controls",
				displayType
			});
			const groupsWrapClasses = [
				"control-groups",
				"formeo-panels-wrap",
				`panel-count-${groupedFields.length}`
			];
			const groupsWrap = dom.create({
				className: groupsWrapClasses,
				content: [this.panels.panelNav, this.panels.panelsWrap]
			});
			const controlClasses = ["formeo-controls"];
			if (sticky) controlClasses.push("formeo-sticky");
			const element = dom.create({
				className: controlClasses,
				content: [groupsWrap, formActions]
			});
			const groups = element.getElementsByClassName("control-group");
			this.dom = element;
			this.groups = groups;
			const [firstGroup] = groups;
			this.currentGroup = firstGroup;
			this.actions = {
				filter: (term) => {
					const filtering = term !== "";
					const fields = this.controls;
					let filteredTerm = groupsWrap.querySelector(".filtered-term");
					dom.toggleElementsByStr(fields, term);
					if (filtering) {
						const filteredStr = s.get("controls.filteringTerm", term);
						element.classList.add("filtered");
						if (filteredTerm) filteredTerm.textContent = filteredStr;
						else {
							filteredTerm = dom.create({
								tag: "h5",
								className: "filtered-term",
								content: filteredStr
							});
							groupsWrap.insertBefore(filteredTerm, groupsWrap.firstChild);
						}
					} else if (filteredTerm) {
						element.classList.remove("filtered");
						filteredTerm.remove();
					}
				},
				addElement: this.addElement,
				addGroup: (group) => console.log(group)
			};
			for (let i = groups.length - 1; i >= 0; i--) {
				const storeID = `formeo-controls-${groups[i]}`;
				if (!this.options.sortable) globalThis.localStorage.removeItem(storeID);
				Sortable.create(groups[i], {
					animation: 150,
					fallbackClass: "control-moving",
					fallbackOnBody: true,
					forceFallback: true,
					fallbackTolerance: 5,
					group: {
						name: "controls",
						pull: "clone",
						put: false,
						revertClone: true
					},
					onClone: ({ clone, item }) => {
						clone.id = item.id;
						if (this.options.ghostPreview) {
							const { controlData } = this.get(item.id);
							Promise.resolve().then(() => (init_field(), field_exports)).then(({ default: Field }) => {
								clone.innerHTML = "";
								clone.appendChild(new Field(controlData).preview);
							});
						}
					},
					onStart: () => {
						this.originalDocumentOverflow = document.documentElement.style.overflow;
						document.documentElement.style.overflow = "hidden";
					},
					onEnd: () => {
						document.documentElement.style.overflow = this.originalDocumentOverflow;
						this.originalDocumentOverflow = null;
					},
					sort: this.options.sortable,
					store: {
						/**
						* Get the order of elements.
						* @param   {Sortable}  sortable
						* @return {Array}
						*/
						get: () => {
							const order = globalThis.localStorage.getItem(storeID);
							return order ? order.split("|") : [];
						},
						/**
						* Save the order of elements.
						* @param {Sortable}  sortable
						*/
						set: (sortable) => {
							const order = sortable.toArray();
							globalThis.localStorage.setItem(storeID, order.join("|"));
						}
					}
				});
			}
			return element;
		}
		layoutTypes = {
			row: () => stages.active.addChild(),
			column: () => this.layoutTypes.row().addChild(),
			field: (controlData) => this.layoutTypes.column().addChild(controlData)
		};
		/**
		* Append an element to the stage
		* @param {String} id of elements
		*/
		addElement = (id) => {
			const { meta: { group, id: metaId }, ...elementData } = get(this.get(id), "controlData");
			set(elementData, "config.controlId", metaId);
			if (group === "layout") return this.layoutTypes[metaId.replace("layout-", "")]();
			return this.layoutTypes.field(elementData);
		};
		applyOptions = async (controlOptions = {}) => {
			const { container, elements, groupOrder, ...options } = merge(defaultOptions, controlOptions);
			this.container = dom.resolveContainer(container);
			this.groupOrder = unique(groupOrder.concat([
				"common",
				"html",
				"layout"
			]));
			this.options = options;
			const [layoutControls, formControls, htmlControls] = await Promise.all([
				Promise.resolve().then(() => (init_layout(), layout_exports)),
				Promise.resolve().then(() => (init_form(), form_exports)),
				Promise.resolve().then(() => (init_html(), html_exports))
			]);
			const allControls = [
				layoutControls.default,
				formControls.default,
				htmlControls.default
			].flat();
			return Promise.all(this.registerControls([...allControls, ...elements]));
		};
	};
	controls_default = new Controls$2();
}));
//#endregion
//#region src/lib/js/components/component.js
var Controls$1, propertyOptions, Component;
var init_component = __esmMin((() => {
	init_animation();
	init_dom();
	init_events();
	init_helpers$2();
	init_utils();
	init_object();
	init_string();
	init_constants();
	init_data();
	init_edit_panel();
	init_components();
	init_panels();
	Controls$1 = null;
	propertyOptions = objectFromStringArray(PROPERTY_OPTIONS);
	Component = class extends Data {
		constructor(name, dataArg = {}) {
			const data = {
				...dataArg,
				id: dataArg.id || uuid()
			};
			super(name, data);
			this.id = data.id;
			this.shortId = this.id.slice(0, this.id.indexOf("-"));
			this.name = name;
			this.indexName = `${name}s`;
			this.config = {
				...data.config,
				...components[`${this.name}s`].config
			};
			this.address = `${this.name}s.${this.id}`;
			this.dataPath = `${this.address}.`;
			this.editPanels = /* @__PURE__ */ new Map();
			this.eventListeners = /* @__PURE__ */ new Map();
			this.initEventHandlers();
		}
		/**
		* Initialize event handlers based on config
		*/
		initEventHandlers() {
			if (!this.config.events) return;
			Object.entries(this.config.events).forEach(([eventName, handler]) => {
				this.addEventListener(eventName, handler);
			});
		}
		/**
		* Add an event listener to this component
		* @param {string} eventName - Name of the event
		* @param {function} handler - Event handler function
		*/
		addEventListener(eventName, handler) {
			if (!this.eventListeners.has(eventName)) this.eventListeners.set(eventName, []);
			this.eventListeners.get(eventName).push(handler);
		}
		/**
		* Remove an event listener from this component
		* @param {string} eventName - Name of the event
		* @param {function} handler - Event handler function to remove
		*/
		removeEventListener(eventName, handler) {
			if (!this.eventListeners?.has(eventName)) return;
			const handlers = this.eventListeners.get(eventName);
			const index = handlers.indexOf(handler);
			if (index > -1) handlers.splice(index, 1);
		}
		/**
		* Dispatch a component event to all registered listeners
		* @param {string} eventName - Name of the event to dispatch
		* @param {object} eventData - Data to pass to event handlers
		*/
		dispatchComponentEvent(eventName, eventData = {}) {
			const fullEventData = {
				component: this,
				target: this,
				type: eventName,
				timestamp: Date.now(),
				...eventData
			};
			if (this.eventListeners?.has(eventName)) this.eventListeners.get(eventName).forEach((handler) => {
				try {
					if (typeof handler === "function") handler(fullEventData);
				} catch (error) {
					console.error(`Error in ${eventName} event handler for ${this.name} ${this.id}:`, error);
				}
			});
			return fullEventData;
		}
		/**
		* Override Data.set to dispatch component update events
		*/
		set(path, newVal) {
			const oldVal = this.get(path);
			const result = super.set(path, newVal);
			if (oldVal !== newVal && this.dom) this.dispatchComponentEvent("onUpdate", {
				path,
				oldValue: oldVal,
				newValue: newVal
			});
			return result;
		}
		get js() {
			return this.data;
		}
		get json() {
			return this.data;
		}
		remove = (path) => {
			if (path) {
				const delPath = splitAddress(path);
				const delItem = delPath.pop();
				const parent = this.get(delPath);
				if (Array.isArray(parent)) if (isInt(delItem)) parent.splice(Number(delItem), 1);
				else this.set(delPath, parent.filter((item) => item !== delItem));
				else delete parent[delItem];
				return parent;
			}
			if (this.name === "stage") return null;
			const parent = this.parent;
			const children = this.children;
			this.dispatchComponentEvent("onRemove", {
				path,
				parent,
				children: [...children]
			});
			forEach(children, (child) => child.remove());
			this.dom.remove();
			remove(components.getAddress(`${parent.name}s.${parent.id}.children`), this.id);
			if (!parent.children.length) parent.emptyClass();
			if (parent.name === "row") parent.autoColumnWidths();
			const removeEvent = {
				row: EVENT_FORMEO_REMOVED_ROW,
				column: EVENT_FORMEO_REMOVED_COLUMN,
				field: EVENT_FORMEO_REMOVED_FIELD
			}[this.name];
			if (removeEvent) events.formeoUpdated({
				componentId: this.id,
				componentType: this.name,
				parent
			}, removeEvent);
			return components[`${this.name}s`].delete(this.id);
		};
		/**
		* Removes element from DOM and data
		* @return  {Object} parent element
		*/
		empty() {
			const removed = this.children.map((child) => {
				child.remove();
				return child;
			});
			this.dom.classList.add("empty");
			return removed;
		}
		/**
		* Apply empty class to element if does not have children
		*/
		emptyClass = () => this.dom.classList.toggle("empty", !this.children.length);
		/**
		* Move, close, and edit buttons for row, column and field
		* @return {Object} element config object
		*/
		getActionButtons() {
			const hoverClassnames = [`hovering-${this.name}`, "hovering"];
			return {
				className: [`${this.name}-actions`, "group-actions"],
				action: {
					mouseenter: () => {
						components.stages.active.dom.classList.add(`active-hover-${this.name}`);
						this.dom.classList.add(...hoverClassnames);
					},
					mouseleave: ({ target }) => {
						this.dom.classList.remove(...hoverClassnames);
						components.stages.active.dom.classList.remove(`active-hover-${this.name}`);
						target.removeAttribute("style");
					}
				},
				children: [{
					...dom.btnTemplate({ content: dom.icon(`handle-${this.name}`) }),
					className: ["component-handle", `${this.name}-handle`]
				}, {
					className: ["action-btn-wrap", `${this.name}-action-btn-wrap`],
					children: this.buttons
				}]
			};
		}
		getComponentTag = () => {
			return dom.create({
				tag: "span",
				className: ["component-tag", `${this.name}-tag`],
				children: [dom.icon(`handle-${this.name}`), toTitleCase(this.name)].filter(Boolean)
			});
		};
		/**
		* Toggles the edit window
		* @param {Boolean} open whether to open or close the edit window
		*/
		toggleEdit(open = !this.isEditing) {
			this.isEditing = open;
			const element = this.dom;
			const editingClassName = "editing";
			const editingComponentClassname = `${editingClassName}-${this.name}`;
			const editWindow = this.dom.querySelector(`.${this.name}-edit`);
			animate.slideToggle(editWindow, 333, open);
			if (this.name === "field") {
				animate.slideToggle(this.preview, 333, !open);
				element.parentElement.classList.toggle(`column-${editingComponentClassname}`, open);
			}
			element.classList.toggle(editingClassName, open);
			element.classList.toggle(editingComponentClassname, open);
		}
		get buttons() {
			if (this.actionButtons) return this.actionButtons;
			const buttonConfig = {
				handle: (icon = `handle-${this.name}`) => ({
					...dom.btnTemplate({ content: dom.icon(icon) }),
					className: ["component-handle"]
				}),
				move: (icon = "move") => {
					return {
						...dom.btnTemplate({ content: dom.icon(icon) }),
						className: ["item-move"],
						meta: { id: "move" }
					};
				},
				edit: (icon = "edit") => {
					return {
						...dom.btnTemplate({ content: dom.icon(icon) }),
						className: ["edit-toggle"],
						meta: { id: "edit" },
						action: { click: () => {
							this.toggleEdit();
						} }
					};
				},
				remove: (icon = "remove") => {
					return {
						...dom.btnTemplate({ content: dom.icon(icon) }),
						className: ["item-remove"],
						meta: { id: "remove" },
						action: { click: () => {
							animate.slideUp(this.dom, 333, () => {
								if (this.name === "column") {
									this.parent.autoColumnWidths();
									this.remove();
								} else this.remove();
							});
						} }
					};
				},
				clone: (icon = "copy") => {
					return {
						...dom.btnTemplate({ content: dom.icon(icon) }),
						className: ["item-clone"],
						meta: { id: "clone" },
						action: { click: () => {
							this.clone(this.parent);
							if (this.name === "column") this.parent.autoColumnWidths();
						} }
					};
				}
			};
			const { buttons, disabled } = this.config.actionButtons;
			const actionButtonsConfigs = buttons.filter((btn) => !disabled.includes(btn)).map((btn) => buttonConfig[btn]?.() || btn);
			this.actionButtons = actionButtonsConfigs;
			return this.actionButtons;
		}
		/**
		* helper that returns the index of the node minus the offset.
		*/
		get index() {
			return indexOfNode(this.dom);
		}
		/**
		* Removes a class or classes from nodeList
		* @param  {String | Array} className
		*/
		removeClasses = (className) => {
			const removeClass = {
				string: () => this.dom.classList.remove(className),
				array: () => className.map((name) => this.dom.classList.remove(name))
			};
			removeClass.object = removeClass.string;
			return removeClass[dom.childType(className)](this.dom);
		};
		get parentType() {
			return PARENT_TYPE_MAP.get(this.name);
		}
		get parent() {
			const parentType = this.parentType;
			if (!this.dom || !parentType) return null;
			const parentDom = this.dom.closest(`.${COMPONENT_TYPE_CLASSNAMES[parentType]}`);
			return parentDom && dom.asComponent(parentDom);
		}
		get children() {
			if (!this.dom) return [];
			const domChildren = this.domChildren;
			const childGroup = CHILD_TYPE_MAP.get(this.name);
			return map(domChildren, (child) => components.getAddress(`${childGroup}s.${child.id}`)).filter(Boolean);
		}
		loadChildren = (children = this.data.children) => children.map((rowId) => this.addChild({ id: rowId }));
		get domChildren() {
			const childWrap = this.dom.querySelector(".children");
			return childWrap ? childWrap.children : [];
		}
		/**
		* Adds a child to the component
		* @param {Object|String} childData
		* @param {Number} index
		* @return {Object} child DOM element
		*/
		addChild(childData = {}, index = this.domChildren.length) {
			let data = childData;
			if (typeof childData !== "object") data = { id: data };
			const childWrap = this.dom.querySelector(".children");
			const { id: childId = uuid() } = data;
			const childGroup = CHILD_TYPE_MAP.get(this.name);
			if (!childGroup) return null;
			const childComponentType = `${childGroup}s`;
			const child = components.getAddress(`${childComponentType}.${childId}`) || components[childComponentType].add(childId, data);
			if (index >= childWrap.children.length) childWrap.appendChild(child.dom);
			else childWrap.children[index].before(child.dom);
			this.dispatchComponentEvent("onAddChild", {
				parent: this,
				target: child,
				child,
				index
			});
			child.dispatchComponentEvent("onAdd", {
				parent: this,
				target: child,
				index,
				addedVia: "addChild"
			});
			this.config.events?.onAddChild?.({
				parent: this,
				child
			});
			const grandChildren = child.get("children");
			if (grandChildren?.length) child.loadChildren(grandChildren);
			this.removeClasses("empty");
			this.saveChildOrder();
			return child;
		}
		/**
		* Updates the children order for the current component
		*/
		saveChildOrder = () => {
			if (this.render) return;
			const newChildOrder = this.children.map(({ id }) => id);
			this.set("children", newChildOrder);
			return newChildOrder;
		};
		/**
		* Method for handling onAdd for all components
		* @todo improve readability of this method
		* @param  {Object} evt
		* @return {Object} Component
		*/
		onAdd({ from, to, item, newIndex }) {
			if (!from.classList.contains("control-group")) from = from.parentElement;
			const fromType = componentType(from);
			const toType = componentType(to.parentElement);
			const defaultOnAdd = () => {
				this.saveChildOrder();
				this.removeClasses("empty");
			};
			const depthMap = new Map([
				[-2, () => {
					const newChild = this.addChild({}, newIndex).addChild();
					return newChild.addChild.bind(newChild);
				}],
				[-1, () => {
					const newChild = this.addChild({}, newIndex);
					return newChild.addChild.bind(newChild);
				}],
				[0, () => this.addChild.bind(this)],
				[1, (controlData) => {
					const currentIndex = indexOfNode(this.dom);
					return () => this.parent.addChild(controlData, currentIndex + 1);
				}],
				[2, (controlData) => () => this.parent.parent.addChild(controlData)]
			]);
			const component = {
				controls: async () => {
					if (!Controls$1) {
						const { default: ControlsData } = await Promise.resolve().then(() => (init_controls(), controls_exports));
						Controls$1 = ControlsData;
					}
					const { controlData: { meta: { id: metaId }, ...elementData } } = Controls$1.get(item.id);
					set(elementData, "config.controlId", metaId);
					const controlType = metaId.startsWith("layout-") ? metaId.replace(/^layout-/, "") : "field";
					const depth = get({
						stage: {
							row: 0,
							column: -1,
							field: -2
						},
						row: {
							row: 1,
							column: 0,
							field: -1
						},
						column: {
							row: 2,
							column: 1,
							field: 0
						},
						field: 1
					}, `${this.name}.${controlType}`);
					const action = depthMap.get(depth)();
					dom.remove(item);
					return action(elementData, newIndex);
				},
				row: () => {
					return (depthMap.get({
						stage: -1,
						row: 0,
						column: 1
					}[toType]) || identity)()?.({ id: item.id }, newIndex);
				},
				column: () => {
					return (depthMap.get({
						stage: -2,
						row: -1
					}[toType]) || identity)()?.(item.id);
				}
			}[fromType]?.(item, newIndex);
			this.dispatchComponentEvent("onAdd", {
				from,
				to,
				item,
				newIndex,
				fromType,
				toType,
				addedComponent: component,
				addedVia: "dragDrop"
			});
			defaultOnAdd();
			return component;
		}
		/**
		* Save updated child order
		* @return {Array} updated child order
		*/
		onSort = () => {
			return this.saveChildOrder();
		};
		/**
		* Handler for removing content from a sortable component
		* @param  {Object} evt
		* @return {Array} updated child order
		*/
		onRemove({ from: { parentElement: from } }) {
			if (from.classList.contains(COLUMN_CLASSNAME)) from.classList.remove("column-editing-field");
			if (this.name !== "stage" && !this.children.length) return this.remove();
			this.emptyClass();
			return this.saveChildOrder();
		}
		/**
		* Callback for when dragging ends
		* @param  {Object} evt
		*/
		onEnd = ({ to: { parentElement: to }, from: { parentElement: from } }) => {
			to?.classList.remove(`hovering-${componentType(to)}`);
			from?.classList.remove(`hovering-${componentType(from)}`);
		};
		/**
		* Callback for onRender, executes any defined onRender for component
		*/
		onRender() {
			this.dispatchComponentEvent("onRender", { dom: this.dom });
			const { events } = this.config;
			if (!events) return null;
			events.onRender && dom.onRender(this.dom, events.onRender);
		}
		/**
		* Sets the configuration for the component. See src/demo/js/options/config.js for example
		* @param {Object} config - Configuration object with possible structures:
		* @param {Object} [config.all] - Global configuration applied to all components
		* @param {Object} [config[controlId]] - Configuration specific to a control type
		* @param {Object} [config[id]] - Configuration specific to a component instance
		* @description Merges configurations in order of precedence:
		* 1. Existing config (this.configVal)
		* 2. Global config (all)
		* 3. Control type specific config
		* 4. Instance specific config
		* The merged result is stored in this.configVal
		*/
		set config(config) {
			const allConfig = get(config, "all");
			const controlId = get(this.data, "config.controlId");
			const mergedConfig = [
				allConfig,
				controlId && get(config, controlId),
				get(config, this.id)
			].reduce((acc, cur) => cur ? merge(acc, cur) : acc, this.configVal);
			this.configVal = mergedConfig;
		}
		get config() {
			return this.configVal;
		}
		runConditions = () => {
			const conditionsList = this.get("conditions");
			if (!conditionsList?.length) return null;
			return conditionsList.map((conditions) => {
				const ifCondition = this.processConditions(conditions.if);
				const thenResult = this.processResults(conditions.then);
				return ifCondition.map((conditions) => {
					return this.evaluateConditions(conditions) && this.execResults(thenResult);
				});
			});
		};
		getComponent(path) {
			const [type, id] = path.split(".");
			const group = components[type];
			return id === this.id ? this : group?.get(id);
		}
		value = (path, val) => {
			const splitPath = path.split(".");
			const component = this.getComponent(path);
			const property = component && splitPath.slice(2, splitPath.length).join(".");
			if ([
				!component,
				!property,
				!propertyOptions[property]
			].some(Boolean)) return path;
			return val ? component.set(propertyOptions[property], val) : component.get(propertyOptions[property]);
		};
		/**
		* Maps operators to their respective handler
		* @param {String} operator
		* @return {Function} action
		*/
		getResult = (operator) => {
			return { "=": (target, propertyPath, value) => target.set(propertyPath, value) }[operator];
		};
		processResults = (results) => {
			return results.map(({ operator, target, value }) => {
				const targetComponent = this.getComponent(target);
				return {
					target: targetComponent,
					propertyPath: targetComponent && target.split(".").slice(2, target.length).join("."),
					action: this.getResult(operator),
					value: this.value(value)
				};
			});
		};
		execResults = (results) => {
			const promises = results.map((result) => {
				return this.execResult(result);
			});
			return Promise.all(promises);
		};
		execResult = ({ target, action, value, _propertyPath }) => {
			return new Promise((resolve, reject) => {
				try {
					return resolve(action(target, value));
				} catch (err) {
					return reject(err);
				}
			});
		};
		cloneData = () => {
			const clonedData = {
				...clone$1(this.data),
				id: uuid()
			};
			if (this.name !== "field") clonedData.children = [];
			return clonedData;
		};
		clone = (parent = this.parent) => {
			const newClone = parent.addChild(this.cloneData(), this.index + 1);
			if (this.name !== "field") this.cloneChildren(newClone);
			this.dispatchComponentEvent("onClone", {
				original: this,
				clone: newClone,
				parent
			});
			return newClone;
		};
		cloneChildren(toParent) {
			for (const child of this.children) child?.clone(toParent);
		}
		createChildWrap = (children) => dom.create({
			tag: "ul",
			attrs: { className: "children" },
			children
		});
		get isRow() {
			return this.name === COMPONENT_TYPE_MAP.row;
		}
		get isColumn() {
			return this.name === COMPONENT_TYPE_MAP.column;
		}
		get isField() {
			return this.name === COMPONENT_TYPE_MAP.field;
		}
		/**
		* Checks if attribute is allowed to be edited
		* @param  {String}  propName
		* @return {Boolean}
		*/
		isDisabledProp = (propName, kind = "attrs") => {
			if (get(this.config, propName)) return false;
			if ((this.config?.disabled || []).includes(propName)) return true;
			const basePropName = trimKeyPrefix(propName);
			return (this.config?.panels[kind]?.disabled || []).includes(basePropName);
		};
		/**
		* Checks if property can be removed
		* @param  {String}  propName
		* @return {Boolean}
		*/
		isLockedProp = (propName, kind = "attrs") => {
			if ((this.config?.locked || []).includes(propName)) return true;
			const basePropName = trimKeyPrefix(propName);
			if ((this.config?.panels[kind]?.locked || []).includes(basePropName)) return true;
			return false;
		};
		/**
		* Generate the markup for field edit mode
		* @return {Object} fieldEdit element config
		*/
		get editWindow() {
			const editWindow = { className: [
				"component-edit",
				`${this.name}-edit`,
				"slide-toggle",
				"formeo-panels-wrap"
			] };
			const editPanelLength = this.editPanels.size;
			if (editPanelLength) {
				editWindow.className.push(`panel-count-${editPanelLength}`);
				editWindow.content = [this.panels.panelNav, this.panels.panelsWrap];
				this.panelNav = this.panels.nav;
				this.resizePanelWrap = this.panels.nav.refresh;
			}
			editWindow.action = { onRender: () => {
				if (editPanelLength === 0) {
					const editToggle = this.dom.querySelector(".edit-toggle");
					const fieldActions = this.dom.querySelector(`.${this.name}-actions`);
					const actionButtons = fieldActions.getElementsByTagName("button");
					fieldActions.style.maxWidth = `${actionButtons.length * actionButtons[0].clientWidth}px`;
					dom.remove(editToggle);
				} else this.resizePanelWrap();
			} };
			return dom.create(editWindow);
		}
		updateEditPanels = () => {
			if (!this.config) return null;
			const editable = new Set(["object", "array"]);
			const panelOrder = unique([...this.config.panels.order, ...Object.keys(this.data)]);
			const noPanels = new Set([
				"children",
				"meta",
				"action",
				"events",
				...this.config.panels.disabled
			]);
			const allowedPanels = panelOrder.filter((panelName) => !noPanels.has(panelName));
			for (const panelName of allowedPanels) {
				const panelData = this.get(panelName);
				const propType = dom.childType(panelData);
				if (editable.has(propType)) {
					const editPanel = new EditPanel(panelData, panelName, this);
					this.editPanels.set(editPanel.name, editPanel);
				}
			}
			const panelsData = {
				panels: Array.from(this.editPanels.values()).map(({ panelConfig }) => panelConfig),
				id: this.id,
				displayType: "auto"
			};
			this.panels = new Panels(panelsData);
			if (this.dom) {
				this.dom.querySelector(".panel-nav").replaceWith(this.panels.panelNav);
				this.dom.querySelector(".panels").replaceWith(this.panels.panelsWrap);
			}
		};
	};
}));
//#endregion
//#region src/lib/js/components/columns/event-handlers.js
var ResizeColumn;
var init_event_handlers = __esmMin((() => {
	init_dom();
	init_helpers$2();
	init_utils();
	init_constants();
	init_components();
	ResizeColumn = class {
		/**
		* Binds the event handlers to the instance.
		*/
		constructor() {
			this.onMove = this.onMove.bind(this);
			this.onStop = this.onStop.bind(this);
			this.cleanup = this.cleanup.bind(this);
		}
		/**
		* Calculates the total width of a row excluding the gaps between columns.
		* @param {HTMLElement} row - The row element.
		* @returns {number} - The total width of the row.
		*/
		getRowWidth(row) {
			const rowChildren = row.querySelector(".children");
			if (!rowChildren) return 0;
			const numberOfColumns = rowChildren.children.length;
			const gapSize = dom.getStyle(rowChildren, "gap") || "0px";
			const gapPixels = parseFloat(gapSize, 10) || 0;
			this.totalGapWidth = gapPixels * (numberOfColumns - 1);
			return rowChildren.offsetWidth - this.totalGapWidth;
		}
		/**
		* Validates if the resize target columns are valid.
		* @param {HTMLElement} column - The column being resized.
		* @param {HTMLElement} sibling - The sibling column.
		* @returns {boolean} - True if both columns are valid, false otherwise.
		*/
		validateResizeTarget(column, sibling) {
			return column && sibling && column.offsetWidth && sibling.offsetWidth;
		}
		/**
		* Handles the start of the resize event.
		* @param {Event} evt - The event object.
		*/
		onStart(evt) {
			evt.preventDefault();
			this.resized = false;
			if (evt.button !== 0) return;
			const column = evt.target.parentElement;
			const sibling = column.nextSibling || column.previousSibling;
			const row = column.closest(`.${ROW_CLASSNAME}`);
			if (!this.validateResizeTarget(column, sibling)) {
				console.warn("Invalid resize targets");
				this.cleanup();
				return;
			}
			this.startX = evt.type === "touchstart" ? evt.touches[0].clientX : evt.clientX;
			row.classList.add(COLUMN_RESIZE_CLASSNAME);
			this.columnPreset = row.querySelector(`.${COLUMN_PRESET_CLASSNAME}`);
			this.originalColumnClass = column.className;
			this.originalSiblingClass = sibling.className;
			column.className = column.className.replace(bsColRegExp, "");
			sibling.className = sibling.className.replace(bsColRegExp, "");
			this.colStartWidth = column.offsetWidth;
			this.sibStartWidth = sibling.offsetWidth;
			this.rowWidth = this.getRowWidth(row);
			if (this.rowWidth <= 0) {
				console.warn("Invalid row width calculated");
				this.cleanup();
				return;
			}
			this.column = column;
			this.sibling = sibling;
			this.row = row;
			try {
				window.addEventListener("pointermove", this.onMove, false);
				window.addEventListener("pointerup", this.onStop, false);
			} catch (error) {
				console.error("Failed to initialize resize listeners:", error);
				this.cleanup();
			}
		}
		/**
		* Calculates the new widths for the columns based on the mouse position.
		* @param {number} clientX - The current X position of the mouse.
		* @returns {Object|null} - The new widths for the columns or null if invalid.
		*/
		calculateNewWidths(clientX) {
			const newColWidth = this.colStartWidth + clientX - this.startX;
			const newSibWidth = this.sibStartWidth - clientX + this.startX;
			const colWidthPercent = parseFloat(percent(newColWidth, this.rowWidth));
			const sibWidthPercent = parseFloat(percent(newSibWidth, this.rowWidth));
			if (colWidthPercent < 10 || sibWidthPercent < 10) return null;
			return {
				colWidth: numToPercent(colWidthPercent.toFixed(1)),
				siblingColWidth: numToPercent(sibWidthPercent.toFixed(1))
			};
		}
		/**
		* Handles the movement during the resize event.
		* @param {Event} evt - The event object.
		*/
		onMove(evt) {
			evt.preventDefault();
			const { column, sibling } = this;
			const clientX = evt.type === "touchmove" ? evt.touches[0].clientX : evt.clientX;
			const newWidths = this.calculateNewWidths(clientX);
			if (!newWidths) return;
			const { colWidth, siblingColWidth } = newWidths;
			column.dataset.colWidth = colWidth;
			sibling.dataset.colWidth = siblingColWidth;
			column.style.width = colWidth;
			sibling.style.width = siblingColWidth;
			this.resized = true;
		}
		onStop() {
			const { column, sibling } = this;
			window.removeEventListener("pointermove", this.onMove);
			window.removeEventListener("pointerup", this.onStop);
			if (!this.resized) return;
			this.setCustomWidthValue();
			components.setAddress(`columns.${column.id}.config.width`, column.dataset.colWidth);
			components.setAddress(`columns.${sibling.id}.config.width`, sibling.dataset.colWidth);
			this.row.classList.remove(COLUMN_RESIZE_CLASSNAME);
			this.resized = false;
			this.cleanup();
		}
		cleanup() {
			if (this.column && this.originalColumnClass) this.column.className = this.originalColumnClass;
			if (this.sibling && this.originalSiblingClass) this.sibling.className = this.originalSiblingClass;
			if (this.row) this.row.classList.remove(COLUMN_RESIZE_CLASSNAME);
			window.removeEventListener("pointermove", this.onMove);
			window.removeEventListener("pointerup", this.onStop);
		}
		/**
		* Adds a custom option from the column width present selecy
		* @param {Node} row
		*/
		setCustomWidthValue() {
			const columnPreset = this.columnPreset;
			let customOption = columnPreset.querySelector(`.${CUSTOM_COLUMN_OPTION_CLASSNAME}`);
			const cols = this.row.querySelector(".children").children;
			const widths = map(cols, (col) => percent(col.clientWidth, this.rowWidth).toFixed(1));
			const value = widths.join(",");
			const content = widths.join(" | ");
			if (!customOption) {
				customOption = dom.create({
					tag: "option",
					attrs: {
						className: CUSTOM_COLUMN_OPTION_CLASSNAME,
						value,
						selected: true
					},
					content
				});
				columnPreset.append(customOption);
			}
			customOption.value = value;
			customOption.textContent = content;
			return value;
		}
	};
}));
//#endregion
//#region src/lib/js/components/columns/column.js
var DEFAULT_DATA, DOM_CONFIGS, Column;
var init_column = __esmMin((() => {
	init_i18n_es_min();
	init_sortable_esm();
	init_dom();
	init_events();
	init_helpers$2();
	init_constants();
	init_component();
	init_event_handlers();
	DEFAULT_DATA = () => Object.freeze({
		config: { width: "100%" },
		children: [],
		className: [COLUMN_CLASSNAME]
	});
	DOM_CONFIGS = {
		resizeHandle: (columnRisizer) => ({
			className: "resize-x-handle",
			action: { pointerdown: columnRisizer.onStart.bind(columnRisizer) },
			content: [dom.icon("triangle-down"), dom.icon("triangle-up")]
		}),
		editWindow: () => ({ className: "column-edit group-config" })
	};
	Column = class extends Component {
		/**
		* Set defaults and/or load existing columns
		* @param  {Object} columnData
		* @return {Object} Column config object
		*/
		constructor(columnData) {
			super("column", {
				...DEFAULT_DATA(),
				...columnData
			});
			const childWrap = this.createChildWrap();
			this.dom = dom.create({
				tag: "li",
				className: [COLUMN_CLASSNAME, "empty"],
				dataset: { hoverTag: s.get("column") },
				id: this.id,
				content: [
					this.getComponentTag(),
					this.getActionButtons(),
					DOM_CONFIGS.editWindow(),
					DOM_CONFIGS.resizeHandle(new ResizeColumn()),
					childWrap
				]
			});
			this.processConfig();
			events.columnResized = new window.CustomEvent("columnResized", { detail: {
				column: this.dom,
				instance: this
			} });
			Sortable.create(childWrap, {
				animation: 150,
				fallbackClass: "field-moving",
				forceFallback: true,
				group: {
					name: "column",
					pull: true,
					put: ["column", "controls"]
				},
				sort: true,
				disabled: false,
				onEnd: this.onEnd.bind(this),
				onAdd: this.onAdd.bind(this),
				onSort: this.onSort.bind(this),
				onRemove: this.onRemove.bind(this),
				onMove: (evt) => {
					if (evt.from !== evt.to) evt.from.classList.remove("hovering-column");
				},
				draggable: `.${FIELD_CLASSNAME}`,
				handle: ".item-move"
			});
		}
		/**
		* Process column configuration data
		* @param  {Object} column
		*/
		processConfig() {
			const columnWidth = helpers.get(this.data, "config.width");
			if (columnWidth) this.setDomWidth(columnWidth);
		}
		refreshFieldPanels = () => {
			for (const field of this.children) field.panels.nav.refresh();
		};
		/**
		* Sets the width data and style for the column
		* @param {string} width - The width value to be set for the column
		* @returns {void}
		*/
		setDomWidth = (width) => {
			this.dom.dataset.colWidth = width;
			this.dom.style.width = width;
		};
		/**
		* Sets a columns width
		* @param {String} width percent or pixel
		*/
		setWidth = (width) => {
			this.setDomWidth(width);
			return this.set("config.width", width);
		};
	};
}));
//#endregion
//#region src/lib/js/components/columns/index.js
var DEFAULT_CONFIG$1, Columns$1, columns;
var init_columns = __esmMin((() => {
	init_component_data();
	init_column();
	DEFAULT_CONFIG$1 = { actionButtons: {
		buttons: [
			"clone",
			"move",
			"remove"
		],
		disabled: []
	} };
	Columns$1 = class extends ComponentData {
		constructor(columnData) {
			super("columns", columnData);
			this.config = { all: DEFAULT_CONFIG$1 };
		}
		Component(data) {
			return new Column(data);
		}
	};
	columns = new Columns$1();
}));
//#endregion
//#region src/lib/js/components/fields/index.js
var DEFAULT_CONFIG, Fields$1, fields;
var init_fields = __esmMin((() => {
	init_utils();
	init_object();
	init_component_data();
	init_controls();
	init_field();
	DEFAULT_CONFIG = () => ({
		actionButtons: {
			buttons: [
				"move",
				"edit",
				"clone",
				"remove"
			],
			disabled: []
		},
		panels: {
			disabled: [],
			attrs: {
				disabled: ["type"],
				hideDisabled: true,
				locked: []
			},
			order: [
				"attrs",
				"options",
				"conditions"
			]
		},
		label: { disableHTML: false }
	});
	Fields$1 = class extends ComponentData {
		constructor(fieldData) {
			super("fields", fieldData);
			this.config = { all: DEFAULT_CONFIG() };
		}
		Component(data) {
			return new Field(data);
		}
		get = (path) => {
			let found = path && get(this.data, path);
			if (!found) {
				const control = controls_default.get(path);
				if (control) found = this.add(null, control.controlData);
			}
			return found;
		};
		getData = () => {
			return Object.entries(this.data).reduce((acc, [key, val]) => {
				const { conditions, ...data } = val?.getData() || val;
				if (conditions?.length) {
					let hasConditions = true;
					if (conditions.length === 1) {
						const [firstCondition] = conditions;
						hasConditions = Boolean(firstCondition.if[0].source);
					}
					if (hasConditions) data.conditions = conditions;
				}
				acc[key] = data;
				return acc;
			}, {});
		};
		load = (dataArg = Object.create(null)) => {
			const allFieldData = parseData(dataArg);
			this.empty();
			for (const [key, val] of Object.entries(allFieldData)) {
				const { meta, ...data } = val;
				if (meta?.id) set(data, "config.controlId", meta?.id);
				this.add(key, data);
			}
			return this.data;
		};
	};
	fields = new Fields$1();
}));
//#endregion
//#region src/lib/js/components/index.js
var components_exports = /* @__PURE__ */ __exportAll({
	Columns: () => Columns,
	Components: () => Components,
	Controls: () => Controls,
	Dialog: () => Dialog,
	Fields: () => Fields,
	Rows: () => Rows,
	Stages: () => Stages,
	default: () => components
});
var Stages, Rows, Columns, Fields, Controls, getFormData, Components, components;
var init_components = __esmMin((() => {
	init_utils();
	init_string();
	init_constants();
	init_columns();
	init_data();
	init_fields();
	init_rows();
	init_stages();
	init_controls();
	init_dialog();
	Stages = stages;
	Rows = rows;
	Columns = columns;
	Fields = fields;
	Controls = controls_default;
	getFormData = (formData, useSessionStorage = false) => {
		if (formData !== void 0 && formData !== null) {
			const parsed = parseData(formData);
			if (parsed && typeof parsed === "object") {
				const cloned = clone$1(parsed);
				return {
					id: cloned.id || DEFAULT_FORMDATA().id,
					stages: cloned.stages || DEFAULT_FORMDATA().stages,
					rows: cloned.rows || {},
					columns: cloned.columns || {},
					fields: cloned.fields || {}
				};
			}
			console.warn("Formeo: Invalid formData provided, using default");
		}
		if (useSessionStorage) {
			const sessionData = sessionStorage.get(SESSION_FORMDATA_KEY);
			if (sessionData) return sessionData;
		}
		return DEFAULT_FORMDATA();
	};
	Components = class extends Data {
		constructor() {
			super("components");
			this.disableEvents = true;
			this.stages = Stages;
			this.rows = Rows;
			this.columns = Columns;
			this.fields = Fields;
			this.controls = Controls;
		}
		load = (formDataArg, opts) => {
			this.empty();
			const formData = getFormData(formDataArg, opts.sessionStorage);
			this.opts = opts;
			this.set("id", formData.id);
			this.add("stages", Stages.load(formData.stages));
			this.add("rows", Rows.load(formData.rows));
			this.add("columns", Columns.load(formData.columns));
			this.add("fields", Fields.load(formData.fields));
			for (const stage of Object.values(this.get("stages"))) stage.loadChildren();
			return this.data;
		};
		/**
		* flattens the component tree
		* @returns {Object} where keys contains component type
		*/
		flatList() {
			const result = {};
			for (const stageId of Object.keys(this.data.stages)) buildFlatDataStructure(this.data, stageId, "stages", result);
			return result;
		}
		getChildData = ({ type, id }) => {
			const component = this.get(type, id);
			if (component) return component.getData();
		};
		get json() {
			return window.JSON.stringify({
				$schema: `https://cdn.jsdelivr.net/npm/formeo@${version$1}/dist/formData_schema.json`,
				...this.formData
			});
		}
		get formData() {
			return {
				id: this.get("id"),
				stages: stages.getData(),
				rows: rows.getData(),
				columns: columns.getData(),
				fields: fields.getData()
			};
		}
		set config(config) {
			const { stages, rows, columns, fields } = config;
			Stages.config = stages;
			Rows.config = rows;
			Columns.config = columns;
			Fields.config = fields;
		}
		getIndex(type) {
			return this[type] || this[COMPONENT_INDEX_TYPE_MAP.get(type)];
		}
		/**
		* call `set` on a component in memory
		*/
		setAddress(fullAddress, value) {
			if (!isAddress(fullAddress)) return;
			const [type, id, ...localAddress] = Array.isArray(fullAddress) ? fullAddress : splitAddress(fullAddress);
			const component = this.getIndex(type).get(id);
			component?.set(localAddress, value);
			return component;
		}
		/**
		* Fetch a component from memory by address
		*/
		getAddress(fullAddress) {
			if (!isAddress(fullAddress)) return;
			const [type, id, ...localAddress] = Array.isArray(fullAddress) ? fullAddress : splitAddress(fullAddress);
			const component = this.getIndex(type).get(id);
			if (localAddress.length && !component) return;
			return localAddress.length ? component.get(localAddress) : component;
		}
	};
	components = new Components();
}));
//#endregion
//#region src/lib/js/common/events.js
function onResizeWindow() {
	throttling = throttling || window.requestAnimationFrame(() => {
		throttling = false;
		for (const column of Object.values(Columns.data)) {
			column.dom.classList.add(NO_TRANSITION_CLASS_NAME);
			Controls.dom.classList.add(NO_TRANSITION_CLASS_NAME);
			Controls.panels.nav.refresh();
			column.refreshFieldPanels();
		}
	});
}
var NO_TRANSITION_CLASS_NAME, defaults$1, defaultCustomEvent, events, formeoUpdatedThrottled, throttling;
var init_events = __esmMin((() => {
	init_components();
	init_constants();
	init_utils();
	NO_TRANSITION_CLASS_NAME = "no-transition";
	defaults$1 = {
		debug: false,
		bubbles: true,
		formeoLoaded: (_evt) => {},
		onAdd: () => {},
		onRemove: () => {},
		onChange: (evt) => events.opts?.debug && console.log(evt),
		onUpdate: (evt) => events.opts?.debug && console.log(evt),
		onUpdateStage: (evt) => events.opts?.debug && console.log(evt),
		onUpdateRow: (evt) => events.opts?.debug && console.log(evt),
		onUpdateColumn: (evt) => events.opts?.debug && console.log(evt),
		onUpdateField: (evt) => events.opts?.debug && console.log(evt),
		onAddRow: (evt) => events.opts?.debug && console.log(evt),
		onAddColumn: (evt) => events.opts?.debug && console.log(evt),
		onAddField: (evt) => events.opts?.debug && console.log(evt),
		onRemoveRow: (evt) => events.opts?.debug && console.log(evt),
		onRemoveColumn: (evt) => events.opts?.debug && console.log(evt),
		onRemoveField: (evt) => events.opts?.debug && console.log(evt),
		onRender: (evt) => events.opts?.debug && console.log(evt),
		onSave: (_evt) => {},
		confirmClearAll: (evt) => {
			if (globalThis.confirm(evt.confirmationMessage)) evt.clearAllAction(evt);
		}
	};
	defaultCustomEvent = ({ src, ...evtData }, type = EVENT_FORMEO_UPDATED) => {
		const evt = new globalThis.CustomEvent(type, {
			detail: evtData,
			bubbles: events.opts?.debug || events.opts?.bubbles
		});
		evt.data = (src || document).dispatchEvent(evt);
		if (type === "formeoUpdated") {
			const changedEvt = new globalThis.CustomEvent(EVENT_FORMEO_CHANGED, {
				detail: evtData,
				bubbles: events.opts?.debug || events.opts?.bubbles
			});
			(src || document).dispatchEvent(changedEvt);
		}
		return evt;
	};
	events = {
		init: function(options) {
			this.opts = {
				...defaults$1,
				...options
			};
			return this;
		},
		formeoSaved: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_SAVED),
		formeoUpdated: (evt, eventType) => defaultCustomEvent(evt, eventType || "formeoUpdated"),
		formeoCleared: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_CLEARED),
		formeoOnRender: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_ON_RENDER),
		formeoConditionUpdated: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_CONDITION_UPDATED),
		formeoAddedRow: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_ADDED_ROW),
		formeoAddedColumn: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_ADDED_COLUMN),
		formeoAddedField: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_ADDED_FIELD),
		formeoRemovedRow: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_REMOVED_ROW),
		formeoRemovedColumn: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_REMOVED_COLUMN),
		formeoRemovedField: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_REMOVED_FIELD)
	};
	formeoUpdatedThrottled = throttle$1(() => {
		const eventData = {
			timeStamp: globalThis.performance.now(),
			type: EVENT_FORMEO_UPDATED,
			detail: components.formData
		};
		events.opts.onUpdate(eventData);
		if (events.opts.onChange !== events.opts.onUpdate) events.opts.onChange(eventData);
	}, ANIMATION_SPEED_FAST);
	document.addEventListener(EVENT_FORMEO_UPDATED, formeoUpdatedThrottled);
	document.addEventListener(EVENT_FORMEO_UPDATED_STAGE, (evt) => {
		const { timeStamp, type, detail } = evt;
		const eventData = {
			timeStamp,
			type,
			detail
		};
		events.opts.onUpdate(eventData);
		events.opts.onUpdateStage(eventData);
	});
	document.addEventListener(EVENT_FORMEO_UPDATED_ROW, (evt) => {
		const { timeStamp, type, detail } = evt;
		const eventData = {
			timeStamp,
			type,
			detail
		};
		events.opts.onUpdate(eventData);
		events.opts.onUpdateRow(eventData);
	});
	document.addEventListener(EVENT_FORMEO_UPDATED_COLUMN, (evt) => {
		const { timeStamp, type, detail } = evt;
		const eventData = {
			timeStamp,
			type,
			detail
		};
		events.opts.onUpdate(eventData);
		events.opts.onUpdateColumn(eventData);
	});
	document.addEventListener(EVENT_FORMEO_UPDATED_FIELD, (evt) => {
		const { timeStamp, type, detail } = evt;
		const eventData = {
			timeStamp,
			type,
			detail
		};
		events.opts.onUpdate(eventData);
		events.opts.onUpdateField(eventData);
	});
	document.addEventListener(EVENT_FORMEO_ADDED_ROW, (evt) => {
		const { timeStamp, type, detail } = evt;
		const eventData = {
			timeStamp,
			type,
			detail
		};
		events.opts.onAdd(eventData);
		events.opts.onAddRow(eventData);
	});
	document.addEventListener(EVENT_FORMEO_ADDED_COLUMN, (evt) => {
		const { timeStamp, type, detail } = evt;
		const eventData = {
			timeStamp,
			type,
			detail
		};
		events.opts.onAdd(eventData);
		events.opts.onAddColumn(eventData);
	});
	document.addEventListener(EVENT_FORMEO_ADDED_FIELD, (evt) => {
		const { timeStamp, type, detail } = evt;
		const eventData = {
			timeStamp,
			type,
			detail
		};
		events.opts.onAdd(eventData);
		events.opts.onAddField(eventData);
	});
	document.addEventListener(EVENT_FORMEO_REMOVED_ROW, (evt) => {
		const { timeStamp, type, detail } = evt;
		const eventData = {
			timeStamp,
			type,
			detail
		};
		events.opts.onRemove(eventData);
		events.opts.onRemoveRow(eventData);
	});
	document.addEventListener(EVENT_FORMEO_REMOVED_COLUMN, (evt) => {
		const { timeStamp, type, detail } = evt;
		const eventData = {
			timeStamp,
			type,
			detail
		};
		events.opts.onRemove(eventData);
		events.opts.onRemoveColumn(eventData);
	});
	document.addEventListener(EVENT_FORMEO_REMOVED_FIELD, (evt) => {
		const { timeStamp, type, detail } = evt;
		const eventData = {
			timeStamp,
			type,
			detail
		};
		events.opts.onRemove(eventData);
		events.opts.onRemoveField(eventData);
	});
	document.addEventListener(EVENT_FORMEO_ON_RENDER, (evt) => {
		const { timeStamp, type, detail } = evt;
		events.opts.onRender({
			timeStamp,
			type,
			detail
		});
	});
	document.addEventListener("confirmClearAll", (evt) => {
		evt = {
			timeStamp: evt.timeStamp,
			type: evt.type,
			confirmationMessage: evt.detail.confirmationMessage,
			clearAllAction: evt.detail.clearAllAction,
			btnCoords: evt.detail.btnCoords
		};
		events.opts.confirmClearAll(evt);
	});
	document.addEventListener(EVENT_FORMEO_SAVED, ({ timeStamp, type, detail: { formData } }) => {
		const evt = {
			timeStamp,
			type,
			formData
		};
		events.opts.onSave(evt);
	});
	document.addEventListener("formeoLoaded", (evt) => {
		events.opts.formeoLoaded(evt.detail.formeo);
	});
	window.addEventListener("resize", onResizeWindow);
}));
//#endregion
//#region src/lib/js/common/actions.js
var defaultActions, actions;
var init_actions = __esmMin((() => {
	init_i18n_es_min();
	init_constants();
	init_events();
	init_utils();
	defaultActions = {
		add: {
			attr: (evt) => {
				const attr = globalThis.prompt(evt.message.attr);
				if (attr && evt.isDisabled(attr)) {
					globalThis.alert(s.get("attributeNotPermitted", attr));
					return actions.add.attrs(evt);
				}
				let val;
				if (attr) {
					val = String(globalThis.prompt(evt.message.value, ""));
					evt.addAction(attr, val);
				}
			},
			option: (evt) => {
				evt.addAction();
			},
			condition: (evt) => {
				evt.addAction(evt);
			},
			config: (evt) => {
				evt.addAction(evt);
			}
		},
		remove: {
			attrs: (evt) => {
				evt.removeAction();
			},
			options: (evt) => {
				evt.removeAction();
			},
			conditions: (evt) => {
				evt.removeAction();
			}
		},
		click: { btn: (evt) => {
			evt.action();
		} },
		save: { form: identity }
	};
	actions = {
		init: function(options) {
			const actionKeys = Object.keys(defaultActions);
			this.opts = actionKeys.reduce((acc, key) => {
				acc[key] = {
					...defaultActions[key],
					...options[key]
				};
				return acc;
			}, options);
			return this;
		},
		add: {
			attrs: (evt) => {
				return actions.opts.add.attr(evt);
			},
			options: (evt) => {
				return actions.opts.add.option(evt);
			},
			conditions: (evt) => {
				evt.template = evt.template || CONDITION_TEMPLATE();
				return actions.opts.add.condition(evt);
			},
			config: (evt) => {
				return actions.opts.add.config(evt);
			}
		},
		remove: {
			attrs: (evt) => {
				return actions.opts.remove.attrs(evt);
			},
			options: (evt) => {
				return actions.opts.remove.options(evt);
			},
			conditions: (evt) => {
				return actions.opts.remove.conditions(evt);
			}
		},
		click: { btn: (evt) => {
			return actions.opts.click.btn(evt);
		} },
		save: { form: (formData) => {
			if (actions.opts.sessionStorage) sessionStorage.set(SESSION_FORMDATA_KEY, formData);
			events.formeoSaved({ formData });
			return actions.opts.save.form(formData);
		} }
	};
}));
//#endregion
//#region src/lib/js/config.js
init_constants();
var defaults = { get editor() {
	return {
		stickyControls: false,
		allowEdit: true,
		dataType: "json",
		debug: false,
		sessionStorage: false,
		editorContainer: null,
		svgSprite: null,
		style: CSS_URL,
		iconFont: null,
		config: {},
		events: {},
		actions: {},
		controls: { container: null },
		i18n: { location: "https://draggable.github.io/formeo/assets/lang/" },
		onLoad: () => {}
	};
} };
//#endregion
//#region src/lib/js/editor.js
init_i18n_es_min();
init_actions();
init_dom();
init_events();
init_loaders();
init_utils();
init_controls();
init_components();
init_constants();
/**
* Initialization states for the editor lifecycle
*/
var INIT_STATES = {
	CREATED: "created",
	LOADING_RESOURCES: "loading",
	INITIALIZING: "initializing",
	READY: "ready",
	ERROR: "error"
};
/**
* Main class
*/
var FormeoEditor$1 = class {
	#initState = INIT_STATES.CREATED;
	#initPromise = null;
	#lockedFormData = null;
	#dataLoadedOnce = false;
	/**
	* @param  {Object} options  formeo options
	* @param  {String|Object}   userFormData loaded formData
	* @return {Object}          formeo references and actions
	*/
	constructor({ formData, ...options }, userFormData) {
		const { actions: actions$1, events: events$1, debug, config, editorContainer, ...opts } = merge(defaults.editor, options);
		if (editorContainer) this.editorContainer = dom.resolveContainer(editorContainer) || null;
		this.opts = opts;
		dom.setOptions = opts;
		components.config = config;
		const providedData = userFormData || formData;
		this.#lockedFormData = providedData ? cleanFormData(providedData) : null;
		this.userFormData = this.#lockedFormData;
		this.Components = components;
		this.dom = dom;
		events.init({
			debug,
			...events$1
		});
		actions.init({
			debug,
			sessionStorage: opts.sessionStorage,
			...actions$1
		});
		if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", this.loadResources.bind(this));
		else this.loadResources();
	}
	get formData() {
		return this.Components.formData;
	}
	set formData(data = {}) {
		const cleaned = cleanFormData(data);
		this.#lockedFormData = cleaned;
		this.userFormData = cleaned;
		this.load(this.userFormData, this.opts);
	}
	loadData(data = {}) {
		this.formData = data;
	}
	get json() {
		return this.Components.json;
	}
	/**
	* Clear the editor and reset to initial state
	* @return {void}
	*/
	clear() {
		const defaultData = DEFAULT_FORMDATA();
		this.#lockedFormData = defaultData;
		this.userFormData = defaultData;
		this.Components.load(this.userFormData, this.opts);
		this.render();
	}
	/**
	* Load remote resources
	* @return {Promise} asynchronously loaded remote resources
	*/
	async loadResources() {
		document.removeEventListener("DOMContentLoaded", this.loadResources);
		this.#initState = INIT_STATES.LOADING_RESOURCES;
		const promises = [
			fetchIcons(this.opts.svgSprite),
			fetchFormeoStyle(this.opts.style),
			s.init({
				preloaded: { "en-US": i },
				...this.opts.i18n,
				locale: globalThis.sessionStorage?.getItem(SESSION_LOCALE_KEY)
			})
		].filter(Boolean);
		try {
			await Promise.all(promises);
			if (this.opts.allowEdit) this.init();
		} catch (error) {
			this.#initState = INIT_STATES.ERROR;
			console.error("Failed to load resources:", error);
			throw error;
		}
	}
	/**
	* Formeo initializer
	* @return {Promise} References to formeo instance,
	* dom elements, actions events and more.
	*/
	init() {
		if (this.#initState === INIT_STATES.INITIALIZING) return this.#initPromise;
		if (this.#initState === INIT_STATES.READY) return this.#refreshUI();
		this.#initState = INIT_STATES.INITIALIZING;
		this.#initPromise = controls_default.init(this.opts.controls, this.opts.stickyControls).then((controls) => {
			this.controls = controls;
			if (!this.#dataLoadedOnce) {
				this.#loadInitialData();
				this.#dataLoadedOnce = true;
			}
			this.formId = components.get("id");
			this.i18n = { setLang: this.#setLanguage.bind(this) };
			this.render();
			this.#initState = INIT_STATES.READY;
			this.opts.onLoad?.(this);
			this.tooltipInstance = new SmartTooltip();
			return this;
		}).catch((error) => {
			this.#initState = INIT_STATES.ERROR;
			console.error("Failed to initialize editor:", error);
			throw error;
		});
		return this.#initPromise;
	}
	/**
	* Set language without reloading form data (fixes race condition)
	* @param {string} formeoLocale - locale code
	* @return {Promise}
	*/
	async #setLanguage(formeoLocale) {
		globalThis.sessionStorage?.setItem(SESSION_LOCALE_KEY, formeoLocale);
		await s.setCurrent(formeoLocale);
		await this.#refreshUI();
	}
	/**
	* Refresh UI without reloading data (used for language changes)
	* @return {Promise}
	*/
	async #refreshUI() {
		this.controls = await controls_default.init(this.opts.controls, this.opts.stickyControls);
		this.render();
		return this;
	}
	/**
	* Load initial data with proper priority
	*/
	#loadInitialData() {
		const dataToLoad = this.#getDataWithPriority();
		this.Components.load(dataToLoad, this.opts);
	}
	/**
	* Get form data with proper priority:
	* 1. User-provided data (locked at construction)
	* 2. SessionStorage (if enabled)
	* 3. Default empty form
	* @return {Object} form data to load
	*/
	#getDataWithPriority() {
		if (this.#lockedFormData) return clone$1(this.#lockedFormData);
		if (this.opts.sessionStorage) {
			const sessionData = sessionStorage.get(SESSION_FORMDATA_KEY);
			if (sessionData) return sessionData;
		}
		return DEFAULT_FORMDATA();
	}
	load(formData = this.userFormData, opts = this.opts) {
		this.Components.load(formData, opts);
		this.render();
	}
	/**
	* Get current initialization state
	* @return {string} current state
	*/
	get initState() {
		return this.#initState;
	}
	/**
	* Check if the editor is ready
	* @return {boolean}
	*/
	get isReady() {
		return this.#initState === INIT_STATES.READY;
	}
	/**
	* Wait for the editor to be ready
	* @return {Promise} resolves when editor is ready
	*/
	async whenReady() {
		if (this.#initState === INIT_STATES.READY) return this;
		if (this.#initState === INIT_STATES.ERROR) return Promise.reject(/* @__PURE__ */ new Error("Editor initialization failed"));
		if (this.#initPromise) return this.#initPromise;
		return new Promise((resolve, reject) => {
			const checkReady = () => {
				if (this.#initState === INIT_STATES.READY) resolve(this);
				else if (this.#initState === INIT_STATES.ERROR) reject(/* @__PURE__ */ new Error("Editor initialization failed"));
				else globalThis.requestAnimationFrame(checkReady);
			};
			checkReady();
		});
	}
	/**
	* Render the formeo sections
	* @return {void}
	*/
	render() {
		if (!this.controls) return globalThis.requestAnimationFrame(() => this.render());
		this.stages = Object.values(components.get("stages"));
		if (this.opts.controlOnLeft) for (const stage of this.stages) stage.dom.style.order = 1;
		const elemConfig = {
			attrs: {
				className: "formeo formeo-editor",
				id: this.formId
			},
			content: [this.stages.map(({ dom }) => dom)]
		};
		if (s.current.dir) {
			elemConfig.attrs.dir = s.current.dir;
			dom.dir = s.current.dir;
		}
		this.editor = dom.create(elemConfig);
		const controlsContainer = this.controls.container || this.editor;
		if (controlsContainer) {
			if (controlsContainer !== this.editor) dom.empty(controlsContainer);
			controlsContainer.appendChild(this.controls.dom);
		}
		if (this.editorContainer) {
			dom.empty(this.editorContainer);
			this.editorContainer.appendChild(this.editor);
		}
		events.formeoLoaded = new globalThis.CustomEvent("formeoLoaded", { detail: { formeo: this } });
		document.dispatchEvent(events.formeoLoaded);
	}
};
//#endregion
//#region src/lib/js/renderer/helpers.js
var import_isEqual = /* @__PURE__ */ __toESM(require_isEqual(), 1);
init_dom();
init_utils();
init_constants();
var containerLookup = (container) => typeof container === "string" ? document.querySelector(container) : container;
var processOptions = ({ editorContainer, renderContainer, formData, ...opts }) => {
	const processedOptions = {
		renderContainer: containerLookup(renderContainer),
		editorContainer: containerLookup(editorContainer),
		formData: cleanFormData(formData)
	};
	return {
		elements: {},
		...opts,
		...processedOptions
	};
};
var baseId = (id) => {
	return id.match(UUID_REGEXP)?.[0] || id;
};
var isVisible = (elem) => {
	if (!elem) return false;
	if (elem.hasAttribute("hidden") || elem.parentElement.hasAttribute("hidden")) return false;
	const computedStyle = window.getComputedStyle(elem);
	return !(computedStyle.display === "none" || computedStyle.visibility === "hidden" || computedStyle.opacity === "0");
};
var propertyMap = {
	isChecked: (elem) => {
		return elem.checked;
	},
	isNotChecked: (elem) => {
		return !elem.checked;
	},
	value: (elem) => {
		return elem.value;
	},
	isVisible: (elem) => {
		return isVisible(elem);
	},
	isNotVisible: (elem) => {
		return !isVisible(elem);
	}
};
var createRemoveButton = () => dom.btnTemplate({
	className: "remove-input-group",
	children: dom.icon("remove"),
	action: {
		mouseover: ({ target }) => target.parentElement.classList.add("will-remove"),
		mouseleave: ({ target }) => target.parentElement.classList.remove("will-remove"),
		click: ({ target }) => target.parentElement.remove()
	}
});
var comparisonHandlers = {
	equals: import_isEqual.default,
	notEquals: (source, target) => !(0, import_isEqual.default)(source, target),
	contains: (source, target) => source.includes(target),
	notContains: (source, target) => !source.includes(target)
};
var comparisonMap = Object.entries(COMPARISON_OPERATORS).reduce((acc, [key, value]) => {
	acc[value] = comparisonHandlers[key];
	acc[key] = comparisonHandlers[key];
	return acc;
}, {});
var assignmentHandlers = { equals: (elem, { targetProperty, value }) => {
	elem[`_${targetProperty}`] = elem[targetProperty];
	elem[targetProperty] = value;
} };
var assignmentMap = Object.entries(ASSIGNMENT_OPERATORS).reduce((acc, [key, value]) => {
	acc[value] = assignmentHandlers[key];
	acc[key] = assignmentHandlers[key];
	return acc;
}, {});
var targetPropertyMap = {
	isChecked: (elem) => {
		elem.checked = true;
	},
	isNotChecked: (elem) => {
		elem.checked = false;
	},
	value: (elem, { assignment, ...rest }) => {
		const assignmentAction = assignmentMap[assignment]?.(elem, rest);
		const event = new Event("input", { bubbles: true });
		elem.dispatchEvent(event);
		return assignmentAction;
	},
	isNotVisible: (elem) => {
		if (elem?._required === void 0) elem._required = elem.required;
		elem.parentElement.setAttribute("hidden", true);
		elem.required = false;
	},
	isVisible: (elem) => {
		elem.parentElement.removeAttribute("hidden");
		elem.required = elem._required;
	}
};
//#endregion
//#region src/lib/js/renderer/index.js
init_dom();
init_loaders();
init_utils();
init_string();
init_constants();
var FormeoRenderer$1 = class {
	constructor(opts, formDataArg) {
		const { renderContainer: container, elements, formData, config } = processOptions(opts);
		this.container = container;
		this.form = cleanFormData(formDataArg || formData);
		this.elements = elements;
		this.config = config;
		this.components = Object.create(null);
		this.dom = dom;
	}
	get formData() {
		return this.form;
	}
	set formData(data) {
		this.form = cleanFormData(data);
	}
	/**
	* Gets the user data from the rendered form as a plain object.
	* Converts FormData to an object, handling multiple values for the same key
	* by converting them into arrays.
	*
	* @returns {Object.<string, string|string[]>} An object containing form field names as keys
	* and their values. Fields with multiple values are stored as arrays.
	*
	* @example
	* // Form with single values
	* { username: 'john', email: 'john@example.com' }
	*
	* @example
	* // Form with multiple values for same key
	* { username: 'john', hobbies: ['reading', 'gaming'] }
	*/
	get userData() {
		const form = this.container.querySelector(".formeo-render") || this.renderedForm;
		if (!form) return {};
		const formEntries = new FormData(form);
		const formDataObj = {};
		for (const [key, value] of formEntries.entries()) if (formDataObj[key]) if (Array.isArray(formDataObj[key])) formDataObj[key].push(value);
		else formDataObj[key] = [formDataObj[key], value];
		else formDataObj[key] = value;
		return formDataObj;
	}
	/**
	* Gets the user form data as an array of field objects.
	* Combines user input values with component metadata to create structured field data.
	*
	* @returns {Array<{key: string, value: any, label: string}>} An array of field data objects, where each object contains:
	*   - key: The field identifier
	*   - value: The user's input value for the field
	*   - label: The field's label from component configuration (empty string if not found)
	*/
	get userFormData() {
		const userFormData = [];
		for (const [key, value] of Object.entries(this.userData)) {
			const fieldData = {
				key,
				value,
				label: this.components[baseId(key)]?.config?.label || ""
			};
			userFormData.push(fieldData);
		}
		return userFormData;
	}
	set userData(data = {}) {
		const form = this.container.querySelector("form");
		for (const key of Object.keys(data)) {
			const fields = form.elements[key];
			if (fields.length && fields[0].type === "checkbox") {
				const values = Array.isArray(data[key]) ? data[key] : [data[key]];
				for (const field of fields) field.checked = values.includes(field.value);
			} else if (fields.length && fields[0].type === "radio") for (const field of fields) field.checked = field.value === data[key];
			else if (fields.type) fields.value = data[key];
		}
	}
	/**
	* Renders the formData to a target Element
	* @param {Object} formData
	*/
	render(formData = this.form) {
		this.form = cleanFormData(formData);
		const renderedForm = this.getRenderedForm(formData);
		const existingRenderedForm = this.container.querySelector(".formeo-render");
		if (existingRenderedForm) existingRenderedForm.replaceWith(renderedForm);
		else this.container.appendChild(renderedForm);
	}
	getRenderedForm(formData = this.form) {
		this.form = cleanFormData(formData);
		const renderCount = document.getElementsByClassName("formeo-render").length;
		const config = {
			...this.config,
			tag: "form",
			id: this.form.id,
			className: `formeo-render formeo formeo-rendered-${renderCount}`,
			children: this.processedData
		};
		this.renderedForm = dom.render(config);
		this.applyConditions();
		return this.renderedForm;
	}
	get html() {
		return (this.renderedForm || this.getRenderedForm()).outerHTML;
	}
	orderChildren = (type, order) => order.reduce((acc, cur) => {
		acc.push(this.form[type][cur]);
		return acc;
	}, []);
	prefixId = (id) => "f-" + id;
	/**
	* Convert sizes, apply styles for render
	* @param  {Object} columnData
	* @return {Object} processed column data
	*/
	processColumn = ({ id, ...columnData }) => ({
		...columnData,
		id: this.prefixId(id),
		children: this.processFields(columnData.children),
		style: `width: ${columnData.config.width || "100%"}`
	});
	processRows = (stageId) => this.orderChildren("rows", this.form.stages[stageId].children).reduce((acc, row) => {
		if (row) acc.push(this.processRow(row));
		return acc;
	}, []);
	cacheComponent = (data) => {
		this.components[baseId(data.id)] = data;
		return data;
	};
	/**
	* Applies a row's config
	* @param {Object} row data
	* @return {Object} row config object
	*/
	processRow = (data, type = "row") => {
		const { config, id } = data;
		const className = [`formeo-${type}-wrap`];
		const rowData = {
			...data,
			children: this.processColumns(data.id),
			id: this.prefixId(id)
		};
		this.cacheComponent(rowData);
		const children = [
			{
				condition: config.legend,
				result: () => ({
					tag: config.fieldset ? "legend" : "h3",
					children: config.legend
				})
			},
			{
				condition: true,
				result: () => rowData
			},
			{
				condition: config.inputGroup,
				result: () => this.addButton(id)
			}
		].reduce((acc, { condition, result }) => {
			if (condition) acc.push(result());
			return acc;
		}, []);
		if (config.inputGroup) className.push(`f-input-group-wrap`);
		return {
			tag: config.fieldset ? "fieldset" : "div",
			className,
			children
		};
	};
	cloneComponentData = (componentId) => {
		const { children = [], id, attrs = {}, ...rest } = this.components[componentId];
		const updatedAttrs = {
			...attrs,
			"data-clone-of": id
		};
		if (rest.tag === "input") updatedAttrs.name = getName(this.components[componentId]);
		return {
			...rest,
			id: "f-" + uuid(id),
			children: children?.length && children.map(({ id }) => this.cloneComponentData(baseId(id))),
			attrs: updatedAttrs
		};
	};
	addButton = (id) => ({
		tag: "button",
		attrs: {
			className: "add-input-group btn pull-right",
			type: "button"
		},
		children: "Add +",
		action: { click: (e) => {
			const fInputGroup = e.target.parentElement;
			const elem = dom.create(this.cloneComponentData(id));
			fInputGroup.insertBefore(elem, fInputGroup.lastChild);
			const removeButton = dom.create(createRemoveButton());
			elem.appendChild(removeButton);
		} }
	});
	processColumns = (rowId) => {
		return this.orderChildren("columns", this.form.rows[rowId].children).map((column) => this.cacheComponent(this.processColumn(column)));
	};
	processFields = (fieldIds) => this.orderChildren("fields", fieldIds).map(({ id, ...field }) => {
		const controlId = field.config?.controlId || field.meta?.id;
		const { action = {}, dependencies = {} } = this.elements[controlId] || {};
		if (dependencies) fetchDependencies(dependencies);
		const mergedFieldData = merge({ action }, field);
		return this.cacheComponent({
			...mergedFieldData,
			id: this.prefixId(id)
		});
	});
	get processedData() {
		return Object.values(this.form.stages).map((stage) => {
			stage.children = this.processRows(stage.id);
			stage.className = STAGE_CLASSNAME;
			this.components[baseId(stage.id)] = stage;
			return stage;
		});
	}
	/**
	* Evaulate and execute conditions for fields by creating listeners for input and changes
	* @return {Array} flattened array of conditions
	*/
	handleComponentCondition = (component, ifRest, thenConditions) => {
		if (component.length) {
			for (const elem of component) this.handleComponentCondition(elem, ifRest, thenConditions);
			return;
		}
		const listenerEvent = LISTEN_TYPE_MAP(component);
		if (listenerEvent) component.addEventListener(listenerEvent, (evt) => {
			if (this.evaluateCondition(ifRest, evt)) for (const thenCondition of thenConditions) this.execResult(thenCondition, evt);
		}, false);
		const fakeEvt = { target: component };
		if (this.evaluateCondition(ifRest, fakeEvt)) for (const thenCondition of thenConditions) this.execResult(thenCondition, fakeEvt);
	};
	applyConditions = () => {
		for (const { conditions } of Object.values(this.components)) if (conditions) for (const condition of conditions) {
			const { if: ifConditions, then: thenConditions } = condition;
			for (const ifCondition of ifConditions) {
				const { source, target } = ifCondition;
				if (isAddress(source)) {
					const { component, options } = this.getComponent(source);
					const sourceComponent = options || component;
					this.handleComponentCondition(sourceComponent, ifCondition, thenConditions);
				}
				if (isAddress(target)) {
					const { component, options } = this.getComponent(target);
					const targetComponent = options || component;
					this.handleComponentCondition(targetComponent, ifCondition, thenConditions);
				}
			}
		}
	};
	/**
	* Evaulate conditions
	*/
	evaluateCondition = ({ source, sourceProperty, targetProperty, comparison, target }) => {
		const sourceValue = this.getComponentProperty(source, sourceProperty);
		if (typeof sourceValue === "boolean") return sourceValue;
		const targetValue = String(isAddress(target) ? this.getComponentProperty(target, targetProperty) : target);
		return comparisonMap[comparison]?.(sourceValue, targetValue);
	};
	execResult = ({ target, targetProperty, assignment, value }) => {
		if (isAddress(target)) {
			const { component, option } = this.getComponent(target);
			const elem = option || component;
			targetPropertyMap[targetProperty]?.(elem, {
				targetProperty,
				assignment,
				value
			});
		}
	};
	getComponentProperty = (address, propertyName) => {
		const { component, option } = this.getComponent(address);
		const elem = option || component;
		return propertyMap[propertyName]?.(elem) || elem[propertyName];
	};
	getComponent = (address) => {
		const result = { component: null };
		if (!isAddress(address)) return null;
		const [, componentId, optionsKey, optionIndex] = splitAddress(address);
		const component = this.renderedForm.querySelector(`#f-${componentId}`);
		if (!component) return result;
		result.component = component;
		if (optionsKey) {
			const options = component.querySelectorAll("input");
			const option = options[optionIndex];
			result.options = options;
			result.option = option;
			return result;
		}
		return result;
	};
	getComponents = (address) => {
		const components = [];
		const componentId = address.slice(address.indexOf(".") + 1);
		components.push(...this.renderedForm.querySelectorAll(`[name=f-${componentId}]`));
		return components;
	};
};
var listenTypeMap = [["input", (c) => ["textarea", "text"].includes(c.type)], ["change", (c) => ["select"].includes(c.tagName.toLowerCase()) || ["checkbox", "radio"].includes(c.type)]];
var LISTEN_TYPE_MAP = (component) => {
	const [listenerEvent] = listenTypeMap.find((typeMap) => typeMap[1](component)) || [false];
	return listenerEvent;
};
//#endregion
//#region src/lib/js/index.js
if (window !== void 0) {
	window.FormeoEditor = FormeoEditor$1;
	window.FormeoRenderer = FormeoRenderer$1;
}
var FormeoEditor = FormeoEditor$1;
var FormeoRenderer = FormeoRenderer$1;
//#endregion
exports.FormeoEditor = FormeoEditor;
exports.FormeoRenderer = FormeoRenderer;

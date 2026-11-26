// Runs before stylesheets/first paint to avoid a flash of the wrong theme.
(()=>{
  let theme=null,language='en';
  try{
    const storedTheme=localStorage.getItem('ac-theme');
    if(storedTheme==='light'||storedTheme==='dark') theme=storedTheme;
    const storedLanguage=localStorage.getItem('ac-language');
    if(['en','fr','es'].includes(storedLanguage)) language=storedLanguage;
  }catch{/* Preferences still work in memory when storage is unavailable. */}
  const resolved=theme??(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  document.documentElement.dataset.theme=resolved;
  document.documentElement.style.colorScheme=resolved;
  document.documentElement.lang=language;
  window.sitePreferences={theme,language};
})();

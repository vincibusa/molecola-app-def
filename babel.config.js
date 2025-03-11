module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // I plugin di librerie UI esterne sono stati rimossi
    ],
  };
}; 
module.exports = function randomPick(list){
  return list[Math.floor(Math.random() * list.length)];
};

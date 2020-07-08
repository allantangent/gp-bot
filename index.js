const Discord = require('discord.js');
const client = new Discord.Client();
const puppeteer = require('puppeteer');
const { prefix, token, commandLength, numPlayers, screenshotSelector } = require('./config.json');

client.once('ready', () => {
	console.log('Ready!');
});

client.login(token);

client.on('message', message => {
  let messageContent = message.content;
  let command = messageContent.substr(0, commandLength);
  if(command === `${prefix}gp `) {
    let URL = "https://na.op.gg/multi/query=";
    let content = messageContent.substr(4);
    let contentArr = content.split(/[\r\n]/g);
    let playerNames = new Set();

    if(contentArr[0].indexOf(" joined the lobby") == -1) {
      message.channel.send("Command Usage: !gp [copypasta]\r\neg. !gp deadledude joined the lobby");
      return;
    }
    
    for(let i = 0; i < contentArr.length; i++) {
      let playerName = contentArr[i].replace(/ joined the lobby/g, '');
      playerNames.add(playerName);
    }

    let count = 0;
    for(const pName of playerNames.keys()) {
      if(count >= numPlayers) {
        break;
      }
      URL += pName + "%2C";
    }
    message.channel.send("snooping...");
    screenshotStats(URL, message);
  }
});

async function screenshotStats(URL, message) {
  const browser = await puppeteer.launch();
  try{
    const page = await browser.newPage();
    await page.setViewport({width: 1366, height: 768});
    await page.goto(URL);
  
    await page.waitForSelector(screenshotSelector);
    const elementHandle = await page.$(screenshotSelector);
    let screenshot = await elementHandle.screenshot({type: 'png'});
    await message.channel.send("more powder: ", {files:[{ attachment: screenshot, name: "screenshot.png" }]});
  } catch(error) {
    console.log(error);
    message.channel.send('Error. Please try again.');
  } finally {
    await browser.close();
  }
}
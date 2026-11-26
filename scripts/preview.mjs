import {productionServer} from './pages-utils.mjs';
const {server,base}=await productionServer();
const port=Number(process.env.PORT||4174);
server.listen(port,'127.0.0.1',()=>console.log(`Production preview: http://127.0.0.1:${port}${base}`));

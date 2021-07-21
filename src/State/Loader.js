import {ConfigContext} from "./ConfigContext";
import { useEffect, useContext } from 'react';
import axios from 'axios';
import { log } from "../Util/Util";

function Loader (props) {

    const [, setRawConfigs] = useContext(ConfigContext)
    
    const loadInitConfigs = async () => {
        
        const paths = ['config/GeneralHunting.txt', 'config/InternalTools.txt', 'config/EnterpriseLinks.txt']
        let configs = []
        for (let i = 0; i < paths.length; i++) {
            configs.push(await (await fetch(paths[i])).text())
        }
        setRawConfigs(configs)
        
        let test = await axios.get('/ip2asn', {
            params: {
                ip: '1.1.1.2'
            }
        })
        
        log(test)
    }
    
    useEffect(() => {
        loadInitConfigs()
    }, []);
    

    return (
        <div>
            {props.children}
        </div>
    );
}

export default Loader;
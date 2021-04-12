import './App.css';
import { useState, useEffect, useContext } from 'react';
import {useUpdateArgsURL} from "./URLHandler";
import {QueryContext} from "./SearchContext";

// TODO: ip, hostname (domain [website]), phone number, email address, more?
// TODO: auto-format phone number results

function SearchBar({results, setResults}) { // TODO: HAVE AUTO-SELECTED WHEN PAGE IS OPENED!!

    const [search, setSearch] = useState('');
    const [query, setQuery] = useContext(QueryContext);
    const updateArgsURL = useUpdateArgsURL();

    const typeValidation = {
        phone: /^(\d{3})[-. ]?(\d{3})[-. ]?(\d{4})$/,
        domain: /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/, //TODO: don't accept hyphen as first or last
        email: /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-](\.?[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-])+@([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)$/,
        //ip: /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/,
        MD5: /^[A-Fa-f0-9]{32}$/,
        SHA1: /^[A-Fa-f0-9]{40}$/,
        SHA256: /^[A-Fa-f0-9]{64}$/,
    }

    useEffect(() => {

        if (query === '') {
            setResults([])
            return;
        }

        updateArgsURL()

        const ipRegex = require('ip-regex');

        let type = 'Text';
        let subType = 'None';
        if (typeValidation.phone.test(query)) type = 'PhoneNumber'
        else if (ipRegex.v4({exact: true}).test(query)) {
            type = 'IP';
            subType = 'IPv4';
        }
        else if (ipRegex.v6({exact: true}).test(query)) {
            type = 'IP';
            subType = 'IPv6';
        }
        else if (typeValidation.email.test(query)) type = 'Email'
        else if (typeValidation.domain.test(query)) type = 'Domain'
        else if (typeValidation.MD5.test(query)) {
            type = 'Hash';
            subType = 'MD5'
        }
        else if (typeValidation.SHA1.test(query)) {
            type = 'Hash';
            subType = 'SHA1'
        }
        else if (typeValidation.SHA256.test(query)) {
            type = 'Hash';
            subType = 'SHA256'
        }

        // TODO: sanitize indicator (phone, etc.)

        let newResults = [{type, subType, indicator: query}]
        setResults(newResults)

        dnsQueries(newResults);
    }, [query]);

    const dnsQueries = async (newResults) => { // TODO: FIX ISSUE where if the url is changed very quick between domains, the older one can sometimes override the newest addition
        let axios = require('axios');

        const instance = axios.create({
            headers: {'Accept': 'application/dns-json'}
        });

        let arr = [...newResults];
        let diff = false;

        for (let i = 0; i < newResults.length; i++) {
            const result = newResults[i];
            if (result.type === 'Domain') {
                diff = true;
                const dataA = await (await instance.get('https://cloudflare-dns.com/dns-query?name=' + result.indicator + '&type=A')).data
                const dataAAAA = await (await instance.get('https://cloudflare-dns.com/dns-query?name=' + result.indicator + '&type=AAAA')).data
                const dataNS = await (await instance.get('https://cloudflare-dns.com/dns-query?name=' + result.indicator + '&type=NS')).data
                const dataMX = await (await instance.get('https://cloudflare-dns.com/dns-query?name=' + result.indicator + '&type=MX')).data
                const dataTXT = await (await instance.get('https://cloudflare-dns.com/dns-query?name=' + result.indicator + '&type=TXT')).data
                const dataDmarcTXT = await (await instance.get('https://cloudflare-dns.com/dns-query?name=_dmarc.' + result.indicator + '&type=TXT')).data
                arr[i] = {...result, dns: {A: dataA, AAAA: dataAAAA, NS: dataNS, MX: dataMX, TXT: dataTXT, dmarcTXT: dataDmarcTXT}}

            } else if (result.type === 'IP') {
                const res = await instance.get(`http://localhost:53661/v1/as/ip/${result.indicator}`)
                console.log(res)
            }
        }

        if (diff) {
            console.log('dns:', arr[0])
            setResults(arr)
        }
    }

    const getQuery = e => {
        e.preventDefault();
        setQuery(search);
        setSearch('');
    }

    return (
        <form className="SearchContainer" onSubmit={getQuery}>
            <input autoFocus className="SearchBar" type="text" value={search} onChange={e => setSearch(e.target.value)}/>
            <button className="SearchSubmit" type="submit">
                Get Cont3xt
            </button>
        </form>
    );
}

export default SearchBar;

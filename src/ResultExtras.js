import './App.css';
import { useRef } from 'react';
import { Tooltip } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';

const DarkTooltip = withStyles(() => ({
    tooltip: {
        backgroundColor: '#222222',
        color: 'white',
        border: '1px solid #888888',
        fontSize: 12,
    },
}))(Tooltip);


export default function ResultExtras({whoIs, dns, ipData, refData}) {

    const {refIndex, refStack, topRefs, subRefs} = refData;

    const errorTable = {
        1: {name: "FormErr", description: "Format Error"},
        2: {name: "ServFail", description: "Server Failure"},
        3: {name: "NXDomain", description: "Non-Existent Domain"},
        4: {name: "NotImp", description: "Not Implemented"},
        5: {name: "Refused", description: "Query Refused"},
        6: {name: "YXDomain", description: "Name Exists when it should not"},
        7: {name: "YXRRSet", description: "RR Set Exists when it should not"},
        8: {name: "NXRRSet", description: "RR Set that should exist does not"},
        9: {name: "NotAuth", description: "Not Authorized"},
    }

    const topRef = (underCount) => {

        const appendFunc = appendRef()

        refIndex.current = refIndex.current + 1;
        const i = refIndex.current;
        refStack.current.push({index: i, count: 0, maxCount: underCount})

        return el => {
            appendFunc(el)
            topRefs.current[i] = el;
        }
    }

    const appendRef = () => {

        let stackElem = refStack.current[refStack.current.length - 1]

        const mainIndex = {...{a:stackElem.index}}.a;
        const subIndex = {...{a:stackElem.count}}.a;

        const returnFunc = el => {
            if (subRefs.current[mainIndex] === undefined) subRefs.current[mainIndex] = []
            subRefs.current[mainIndex][subIndex] = el;
        }

        stackElem.count++;
        refStack.current[refStack.current.length - 1] = stackElem

        if (refStack.current.length - 1 !== 0 && stackElem.count === stackElem.maxCount) {
            refStack.current.pop()
        }

        return returnFunc;
    }

    const genBoxIP = (data) => {
        const ref = appendRef()

        if (data.error !== undefined) {
            return (
                <div ref={ref} className="ResultBox" style={{
                    justifyContent: 'space-between',
                    marginBottom: 5,
                    padding: 5,
                    marginLeft: 40,
                    fontSize: 12
                }}>
                    <p style={{color: '#FF6666', fontWeight: 'bold'}}>Error {data.status}</p>
                </div>
            );
        }

        return (
            <div ref={ref} className="ResultBox" style={{justifyContent: 'space-between', marginBottom: 5, padding: 5, marginLeft: 40, fontSize: 12}}>
                <DarkTooltip title={data.link} interactive>
                    <div style={{display: 'flex', justifyContent:'flex-start'}}>
                        <p style={{color: 'orange', fontWeight: 'bold', paddingRight: 8}}>Name:</p>
                        <p>{data.name}</p>
                    </div>
                </DarkTooltip>
            </div>
        );
    }

    const genBoxDNS = (dnsAnswer, dnsType) => {
        const data = dnsAnswer.data
        const charLimit = 30;

        let content = (data.length > charLimit) ? (
            <DarkTooltip title={data} interactive>
                <div style={{display: 'flex', justifyContent:'flex-start'}}>
                    <p>{data.substring(0, charLimit)}</p>
                    <p style={{color: 'orange'}}>...</p>
                </div>
            </DarkTooltip>
        ) : <p>{data}</p>

        let hasChild = dnsAnswer.ipData !== undefined

        return (
            <div>
                <div ref={hasChild ? topRef(1) : appendRef()} className="ResultBox" style={{justifyContent: 'space-between', marginBottom: 5, padding: 5, marginLeft: 40, fontSize: 12}}>
                    <p style={{color: 'lightgreen', paddingRight: 8, fontWeight: 'bolder'}}>{dnsType}</p>
                    {content}
                </div>
                {hasChild ?
                    <div style={{paddingLeft:30}}>{genBoxIP(dnsAnswer.ipData)}</div> : null
                }
            </div>
        );
    }

    const test = () => {
        return null
    }

    const resetRefs = () => {
        topRefs.current = [topRefs.current[0]]
        refIndex.current = 0
        refStack.current = [{index: 0, count: 0}]
        return null
    }

    return (
        <div>
            {resetRefs()}

            {
                (whoIs === undefined) ? null :
                    <div ref={appendRef()} className="ResultBox" style={{justifyContent: 'space-between', marginBottom: 5, padding: 5, marginLeft: 40, fontSize: 12}}>
                        <div style={{display: 'flex', justifyContent:'flex-start'}}>
                            <p style={{paddingRight: 8, color: 'orange', fontWeight: 'bold'}}>Country:</p>
                            <p>{whoIs.adminCountry}</p>
                        </div>
                    </div>
            }

            { // DNS
                (dns === undefined) ? null :

                Object.keys(dns).map(dnsType => {
                    if (dns[dnsType] === undefined) {
                        return null
                    } else if (dns[dnsType].Status !== 0) {
                        return (
                            <div ref={appendRef()} className="ResultBox" style={{justifyContent: 'space-between', marginBottom: 5, padding: 5, marginLeft: 40, fontSize: 12}}>
                                <p style={{paddingRight: 8, color: 'orange'}}>{dnsType}</p>
                                <p style={{paddingRight: 8, color: '#FF6666', fontWeight: 'bold'}}>{errorTable[dns[dnsType].Status].name}:</p>
                                <p style={{color: '#FF6666', fontWeight: 'bold'}}>{errorTable[dns[dnsType].Status].description}</p>
                            </div>
                        )
                    } else if (dns[dnsType].Answer !== undefined) {
                        return dns[dnsType].Answer.map(dnsAnswer => genBoxDNS(dnsAnswer, dnsType))
                    }
                })
            }

            { // IP DATA
                (ipData === undefined) ? null : genBoxIP(ipData)
            }

            {test()}
        </div>
    );
}

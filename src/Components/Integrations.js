import ComponentTooltip from "./ComponentTooltip";
import { ColorDictBox, PassiveTotalPassiveDNSColorDictBox } from "./ColorDictBox";
import { whiteFilter } from "../Util/Filters";
import { classificationObj } from "../Util/Classification";
import { log, stripTrailingPeriod } from "../Util/Util";
import { TooltipCopy } from "./TooltipCopy";

const withPipe = (html) => {
	if (!html) return;
	return (
		<span style={{alignItems: 'center'}}>
			<p style={{marginLeft: 10}}>|</p>
			{html}
		</span>
	);
}

// TODO: extract the 'exists' removing out of the toColorText!

const cleanSpur = (dict) => {
	const clean = {};
	for (const key of Object.keys(dict)) {
		if (key !== 'ip' && (key !== 'anonymous' || dict.anonymous === true)) clean[key] = dict[key];
	}
	
	return clean;
}

const cleanCensys = (dict) => {
	const clean = {};
	for (const key of Object.keys(dict)) {
		if (key !== 'ip') clean[key] = dict[key];
	}
	
	return clean;
}

const cleanWhoIs = (dict) => {
	const keepFields = [
		'adminCountry',
		'registrar', 'registrantOrganization',
		'creationDate', 'created',
		'updatedDate'
	];
	
	const clean = {};
	for (const key of Object.keys(dict)) {
		if (keepFields.indexOf(key) !== -1) clean[key] = dict[key];
	}
	
	return clean;
}

const cleanPassiveTotalWhois = (dict) => {
	const clean = {};
	for (const key of Object.keys(dict)) {
		if (key !== 'rawText' && key !== 'domain') clean[key] = dict[key];
	}
	
	return clean;
}

const cleanPassiveTotalPassiveDNS = (dict) => {
	const clean = {};
	for (const key of Object.keys(dict)) {
		if (dict[key] != null && key !== 'queryValue' && key !== 'queryType') clean[key] = dict[key];
	}
	
	const snipDate = (date) => date.substring(0, date.indexOf(' ')).replaceAll('-', '‑'); // uses non-breaking hyphens

	clean.results = clean.results.map(result => {
		const {recordType, resolveType, resolve, firstSeen, lastSeen} = result;
		return {
			recordType, resolveType,
			resolve: stripTrailingPeriod(resolve),
			firstSeen: snipDate(firstSeen), lastSeen: snipDate(lastSeen),
			fullFirstSeen: firstSeen, fullLastSeen: lastSeen
		}
	}).sort((a, b) => new Date(b.fullLastSeen) - new Date(a.fullFirstSeen));
	
	return clean;
}

// eslint-disable-next-line no-unused-vars
const noCleaner = (dict) => dict;

export function Integrations({integrations}) {
	
	
	
	if (!integrations) return null;
	
	const {
		spurResult,
		censysResult,
		whoisResult,
		passiveTotalWhoisResult,
		passiveTotalSubDomainsResult,
		passiveTotalPassiveDNSResult,
		
		indicatorData = classificationObj('WARNING: no indicator found'),
	} = integrations;
	
	// local methods
	const createIntegration = (result, cleaner, img) => {
		return (
			!result ? null :
				<ComponentTooltip comp={
					<ColorDictBox data={cleaner(result.data)} indicatorData={indicatorData}/>
				}>
					{img}
				</ComponentTooltip>
		);
	}
	
	const createListIntegration = (list, img) => {
		
		const copyVal = [indicatorData.stringify(), 'Subdomains:'].concat(list).join('\n');
		
		return (
			<ComponentTooltip comp={
				<div className="ResultBox" style={{maxWidth: 800, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 5, padding: 5, fontSize: 12, borderRadius: 8}}>
					<TooltipCopy value={copyVal}/>
					<p style={{color: 'orange', fontWeight: 'bold'}}>Subdomains:</p>
					{list.map(str =>
						<p>{str}</p>
					)}
				</div>
			}>
				{img}
			</ComponentTooltip>
		);
	}
	
	const createPassiveTotalPassiveDNSIntegration = (result, cleaner, img) => {
		return (
			!result ? null :
				<ComponentTooltip comp={
					<PassiveTotalPassiveDNSColorDictBox data={cleaner(result.data)} indicatorData={indicatorData}/>
				}>
					{img}
				</ComponentTooltip>
		);
	}
	
	let hasIntegrations = false;
	for (const val of Object.values(integrations)) {
		if (val != null) {
			hasIntegrations = true;
			break;
		}
	}
	
	if (!hasIntegrations) return null;
	
	const elems = [
		// spur
		createIntegration(spurResult, cleanSpur,
			<img className="ExternalLink" style={{width: 60}} src="./images/spur.png" alt="spur"/>
			),
		// censys
		createIntegration(censysResult, cleanCensys,
			<img className="ExternalLink" src="./images/censysIcon.png" alt="censys"/>
			),
		// whois
		createIntegration(whoisResult, cleanWhoIs,
			<img className="ExternalLink" src="./images/whoisIcon.svg" alt="whois"/>
		),
		// passivetotal whois
		createIntegration(passiveTotalWhoisResult, cleanPassiveTotalWhois,
			<img className="ExternalLink" style={whiteFilter} src="./images/whoisIcon.svg" alt="passivetotal whois"/>
		),
		// passivetotal passive dns
		createPassiveTotalPassiveDNSIntegration(passiveTotalPassiveDNSResult, cleanPassiveTotalPassiveDNS,
			<img className="ExternalLink" src="./images/passivetotalIcon.png" alt="passivetotal passive dns"/>
		),
		// passivetotal subdomains
		(!passiveTotalSubDomainsResult || !passiveTotalSubDomainsResult.data || !passiveTotalSubDomainsResult.data.subdomains) ? null :
			createListIntegration(passiveTotalSubDomainsResult.data.subdomains,
				<img className="ExternalLink" src="./images/passivetotalIcon.png" alt="passivetotal sub-domains"/>
		),
		
	];
	
	return (
		<span style={{alignItems: 'center'}}>
			{elems.map(el => withPipe(el))}
		</span>
	);
}
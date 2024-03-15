**Cont3xt** intends to centralize and simplify a structured approach to gathering contextual intelligence in support of technical investigations.

> This version of **Cont3xt** is a prototype `(and is no longer actively maintained)`. 
> 
> See the in-development version [here](https://arkime.com/cont3xt)!

![cont3xt screenshot](https://github.com/TobySalusky/cont3xt/blob/master/public/images/Capture.PNG?raw=true)

# Easy Installation - Use Docker!
* MacOS - (it takes about 6 minutes to get up and running the first time)
```
git clone https://github.com/TobySalusky/cont3xt.git
cp cont3xt/.env.template cont3xt/.env
cd cont3xt/docker
docker-compose create
export BASE_DIR=`dirname \`pwd\``
docker run -d -p 127.0.0.1:4000:4000 --name c3b docker_c3b
docker run -d -p 127.0.0.1:3001:3001 --env-file=../.env --volume="${BASE_DIR}/public/config:/opt/cont3xt/public/config:ro" --name cont3xt docker_cont3xt
```

* Linux
```
git clone https://github.com/TobySalusky/cont3xt.git
cp cont3xt/.env.template cont3xt/.env
cd cont3xt/docker
docker-compose up
```
Edit your .env file for API Keys

Point your browser at localhost:3001

---

# Manual Install/Configuration

* Install NodeJS (~5-6 minutes)

# Install the UI
```
git clone https://github.com/TobySalusky/cont3xt.git
cd cont3xt
npm ci install
npm audit fix --force
npm audit fix --force ;# Yes, run it twice in order to resolve most vulnerable packages. Right now, there will still be 10 moderate.
;# Add your API Keys to `.env` (after renaming from .env.template), and you can make customizations to /public/config/*.txt configs at any time.
```

* If you add/change API Keys, the NodeJS service must restart.
* Changes to configurations in public/config do not require a restart


# Install the backend 

`( This backend/proxy process is necessary to work around CORS issues )`
```
npx --package express-generator express c3b
git clone https://github.com/TobySalusky/cont3xtbackend.git
cp -Rp cont3xtbackend/* c3b
cd c3b
npm ci install
npm audit fix --force
```

# Start it up

I recommend running this only on your local machine to avoid exposing the interface to any larger/public network. In a separate window, with two different terminal tabs.

1. In your 1st window/tab; # The backend 
```
cd c3b
export HOST=127.0.0.1
npm start
```

2. In your 2nd window/tab; # The UI  
```
cd cont3xt
export HOST=127.0.0.1
export PORT=3001
npm start
```

** Note: First time you try to 'Open All' from a reporting section, you'll need to approve the popup-blocker

===========
# Join cont3xt Discord

https://discord.gg/R4TcCRHcyr

===========

# Using Cont3xt

Cont3xt will attempt to auto enrich supported iTypes of IP, domain/hostname, email address, hashes, phone numbers (not just yet) and sooner or later URL's.

Enter an indicator in the search bar on top. The search bar supports refanging input and identifies the iType. Search does not currently support bulk lookups, but will in the future.


# Auto Enrichments currently supported:

For Domains/hostnames:
1. Use of Cloudflare DNS over HTTPS to perform resolution of records types including A, AAAA, NS, MX, TXT, SPF/DMARC, CAA and SOA. Any explicit IP's resolved will have the IP iType enrichment performed.
2. Direct/Public Whois request. This can be valuable over other third party commercial services which will offer results, but may be cached or not current when dealing with freshly registered domains.
3. PassiveTotal Whois query
4. PassiveTotal PDNS query
5. PassiveTotal subdomains query
6. URLScan 'contains' query 
7. VirusTotal 'contains' query
8. Anomali ThreatStream search query


For IP's:
1. RDAP query identifying RIR, and link to detail.
2. SPUR.us query for IP context
3. Censys IP query
4. Shodan IP query
5. PassiveTotal IP PDNS query
6. VirusTotal IP query
7. Anomali ThreatStream IP query


For Email:
1. Perform a direct connection SMTP sender receipt verification. This is the only heavy touch that cont3xt currently performs. We'll make it an option to NOT perform in the future.
2. Anomali ThreatStream email query
3. Extract the base domain, and perform all relevant Domain enrichment.


For Hashes:
1. VirusTotal Hash query
2. Anomali ThreatStream query


There is a share link option next to the search bar, which will base64 encode the indicator so you can share links without too much worry of tripping network events based on well known indicators.

There is a basic report generation feature that will drop results into a ${indicator}_${TIMESTAMP}.txt file.



# Add your own links:

You can add custom query external links to your own resources as long as you can craft a URL query string with the available format strings: (see public/config/*.txt files)

```
${indicator}
${startDate}
${numDays}
${numHours}
${type}
${subType}
```


Credit:

WhoIs Icon: https://thenounproject.com/term/whois/1581154/

Censys Icon: https://censys.io/

Share Icon: https://iconify.design/icon-sets/fe/share.html

Report Icon: https://www.flaticon.com/free-icon/file_1508964

UrlScan Icon: https://urlscan.io/about/

VirusTotal Icon: https://vecta.io/symbols/100/brands-va-vz/45/virustotal-icon

Outside-external-link Icon: https://commons.wikimedia.org/wiki/File:Icon_External_Link.svgs

Anomali Icon: https://www.programmableweb.com/api/anomali-threatstream-rest-api-v10

Shodan Icon: 


# Kudos
So many thank you's to @MattCarothers for all of the docker configuration help.


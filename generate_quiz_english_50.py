"""Generate quiz_first_50_english.json with Finnish questions and English explanations."""
import json
from pathlib import Path

ROOT = Path(__file__).parent

# Per-question: English translation + keywords + simple explanation
TRANSLATIONS = {
    1: {
        "question": "Why must you turn on your headlights when stopped on a motorway in the dark?",
        "options": {
            "A": "So that other road users can see your stopped vehicle",
            "B": "You can better detect wild animals moving on the road",
            "C": "Parking or low-beam lights consume less power than low-beam lights",
        },
        "keywords": [
            "pimeässä = in the dark",
            "moottoritie = motorway / highway",
            "pysähdyksessä = when stopped",
            "ajovalo = headlight / driving light",
            "jotta muut = so that others",
            "tienkäyttäjät = road users",
        ],
        "simple": "When you stop on a motorway at night, headlights make your vehicle visible to others and reduce the risk of a collision.",
    },
    2: {
        "question": "Why is it advisable to use the 112 Suomi mobile app to call for help at the scene of an accident?",
        "options": {
            "A": "The emergency call goes through faster that way",
            "B": "The emergency response center automatically receives information about the accident location through it",
            "C": "Calling through it is cheaper",
        },
        "keywords": [
            "avun hälyttäminen = alerting / calling for help",
            "onnettomuus = accident",
            "112 Suomi = 112 Finland (official emergency app)",
            "Hätäkeskus = Emergency Response Center",
            "Hätäpuhelu = emergency call",
            "sijainti = location",
        ],
        "simple": "The 112 Suomi app can automatically send your location to the emergency center, which helps responders find the accident quickly.",
    },
    3: {
        "question": "Whose instructions must you follow when there are conflicting traffic directions on the route due to a traffic accident?",
        "options": {
            "A": "Traficom's",
            "B": "The road work contractor's",
            "C": "The traffic controller's",
        },
        "keywords": [
            "ristiriitoista = conflicting",
            "liikenneopastus = traffic guidance / directions",
            "liikenteen valvoja = traffic controller",
            "liikenneonnettomuus = traffic accident",
            "noudattaa = to follow / comply with",
        ],
        "simple": "When traffic signals and instructions conflict, you must follow the traffic controller on site.",
    },
    4: {
        "question": "17-year-old Elviira travels home alone every week from her dance hobby in downtown Kuopio to a detached-house area. Who is responsible for using the seat belt?",
        "options": {
            "A": "The driver",
            "B": "Elviira herself",
            "C": "In a taxi, seat belt use is always voluntary, so the seat belt does not need to be fastened",
        },
        "keywords": [
            "turvavyö = seat belt",
            "vastaa = is responsible for",
            "itse = oneself / herself",
            "kuljettaja = driver",
            "vapaaehtoinen = voluntary",
        ],
        "simple": "Passengers aged 15 or older are responsible for fastening their own seat belt.",
    },
    5: {
        "question": "Who is responsible for the customer's seat belt use when 14-year-old Anna travels home alone every week from her dance hobby in downtown Kuopio to a nearby detached-house area?",
        "options": {
            "A": "Anna herself",
            "B": "The taxi driver",
            "C": "In a taxi, the customer's seat belt use is always voluntary",
        },
        "keywords": [
            "turvavyö = seat belt",
            "asiakas = customer / passenger",
            "Taksinkuljettaja = taxi driver",
            "vastaa = is responsible for",
            "14-vuotias = 14 years old",
        ],
        "simple": "Children under 15 are not responsible for their own seat belt; the driver must ensure it is used.",
    },
    6: {
        "question": "What do you do when a 14-year-old child enters your taxi and says their guardian has allowed them to travel without a seat belt?",
        "options": {
            "A": "You make sure the child uses a seat belt for the entire trip.",
            "B": "You let the child travel without fastening the seat belt if the guardian has made sure the child is seated.",
            "C": "You let the child travel without fastening the seat belt because anyone may travel without a seat belt in a taxi",
        },
        "keywords": [
            "Huolehdit = you make sure / take care of",
            "lapsi = child",
            "turvavyö = seat belt",
            "huoltaja = guardian",
            "koko matkan ajan = for the entire trip",
        ],
        "simple": "A guardian's permission does not override the law. The driver must ensure a 14-year-old uses a seat belt.",
    },
    7: {
        "question": "How must a child under 3 years old be transported in a taxi?",
        "options": {
            "A": "The child may be transported without a safety device as long as they sit in the back seat fastened with a seat belt",
            "B": "The child may be transported in an adult passenger's lap on the back seat",
            "C": "The child must always be transported in an appropriate safety device",
        },
        "keywords": [
            "alle 3-vuotias = under 3 years old",
            "lapsi = child",
            "turvalaite = safety device / child restraint",
            "tulee = must (mandatory)",
            "taksi = taxi",
        ],
        "simple": "Very young children must always travel in a proper child safety device, not just a seat belt or an adult's lap.",
    },
    8: {
        "question": "Which of the following is good customer service related to the use of communication devices?",
        "options": {
            "A": "The driver may send messages if the phone is on silent",
            "B": "Making a phone call if it is necessary to carry out the transport",
            "C": "The driver may make personal phone calls if the customer...",
        },
        "keywords": [
            "viestimet = communication devices",
            "asiakaspalvelu = customer service",
            "Puhelun soittaminen = making a phone call",
            "välttämätön = necessary",
            "kuljetus = transport / ride",
        ],
        "simple": "Phone use while driving is allowed only when necessary for the transport, not for personal conversations.",
    },
    9: {
        "question": "Which of the following is correct when it is freezing outside and you drop off the customer at the address they gave?",
        "options": {
            "A": "You may continue driving when the customer has left the taxi",
            "B": "You may continue driving when you have made sure the customer has gotten indoors",
            "C": "You may continue driving when the customer has reached the yard",
        },
        "keywords": [
            "pakkasta = freezing weather / below zero",
            "asiakas = customer",
            "osoite = address",
            "sisätilaan = indoors / inside",
            "varmistunut = made sure / confirmed",
        ],
        "simple": "In freezing weather, the driver should wait until the customer is safely inside before leaving.",
    },
    10: {
        "question": "A customer asks you to stop on a busy road so they can get out of the ride. Which of the following statements about the situation is correct?",
        "options": {
            "A": "If the place is not safe for stopping, you find another place, because you are responsible for the customer's safe exit from the vehicle.",
            "B": "Even if the place is not safe for stopping, you may stop because the customer has the right to choose the stopping place.",
            "C": "The customer has an obligation to pay any possible fine if they have...",
        },
        "keywords": [
            "pysähtymään = to stop",
            "turvallinen = safe",
            "toisen paikan = another place",
            "vastuullasi = your responsibility",
            "vilkkaasti liikennöity = busy / heavily trafficked",
        ],
        "simple": "The driver must not stop in an unsafe place. If the requested spot is unsafe, choose a nearby safe location.",
    },
    11: {
        "question": "How should the driver act when, upon arrival, they cannot wake the customer after the trip ends and the ride is unpaid?",
        "options": {
            "A": "Take the customer's payment card from their wallet and charge the ride with contactless payment.",
            "B": "The driver should first try verbally to wake the customer and, if necessary, call the police to the scene.",
            "C": "Write an invoice for the customer and put it in their pocket. Move the customer outside the taxi to wake up and call the police.",
        },
        "keywords": [
            "herätellä = to wake someone up",
            "poliisi paikalle = police to the scene",
            "Kuljettaja = driver",
            "maksamatta = unpaid",
            "perille päästyään = upon arrival",
        ],
        "simple": "Try to wake the customer first and call the police if needed. Never take payment without the customer's consent.",
    },
    12: {
        "question": "The customer is a person who cannot communicate with the driver. What is required of the driver?",
        "options": {
            "A": "The taxi driver is required to ensure the customer reaches the correct destination",
            "B": "The taxi driver is required to speak the same language as the customers",
            "C": "The taxi driver is required to have a special permit to carry out the transport",
        },
        "keywords": [
            "määränpäähän = to the destination",
            "Taksinkuljettaja = taxi driver",
            "Asiakas = customer",
            "kommunikoimaan = to communicate",
            "edellytetään = is required",
        ],
        "simple": "Even if communication is difficult, the driver must still get the customer to the correct destination.",
    },
    13: {
        "question": "Why is an alcohol interlock required as mandatory equipment in municipal school and daycare transport?",
        "options": {
            "A": "It prevents the vehicle from moving if the driver has consumed alcohol.",
            "B": "It is intended only as the employer's monitoring tool for the driver's alcohol use",
            "C": "With it, the police check the driver's fitness to drive during traffic enforcement",
        },
        "keywords": [
            "alkolukko = alcohol interlock",
            "estetään = is prevented",
            "alkoholia = alcohol",
            "Kuljettaja = driver",
            "koulu- ja päivähoitokuljetus = school and daycare transport",
        ],
        "simple": "An alcohol interlock stops the vehicle from starting if the driver has alcohol in their breath.",
    },
    14: {
        "question": "How must an alcohol interlock be used in school and daycare transport?",
        "options": {
            "A": "In exceptional cases, the taxi licence holder has the right not to use the alcohol interlock",
            "B": "If the vehicle does not start, the driver may switch to a vehicle that does not have one",
            "C": "In school and daycare transport, a vehicle with an installed alcohol interlock must always be used",
        },
        "keywords": [
            "alkolukko = alcohol interlock",
            "Koulu- ja päivähoitokuljetuksissa = in school and daycare transport",
            "aina = always",
            "asennettu = installed",
            "ajoneuvo = vehicle",
        ],
        "simple": "School and daycare transport must always use a vehicle equipped with an alcohol interlock.",
    },
    15: {
        "question": "Which of the following is correct regarding the taxi driver's conduct in school and daycare transport?",
        "options": {
            "A": "The driver must not talk unnecessarily to children during the trip.",
            "B": "The driver must behave in accordance with the role of a responsible driver.",
            "C": "The driver must not require the passenger to fasten a seat belt.",
        },
        "keywords": [
            "vastuullisen kuljettajan = responsible driver",
            "käyttäytyä = to behave",
            "koulu- ja päivähoitokuljetus = school and daycare transport",
            "turvavyö = seat belt",
        ],
        "simple": "In school transport, the driver must act professionally and responsibly at all times.",
    },
    16: {
        "question": "Who is responsible for obtaining the criminal record extract for the driver of school and daycare transport?",
        "options": {
            "A": "The driver's",
            "B": "The employer's",
            "C": "The school or daycare's",
        },
        "keywords": [
            "Työnantajan = employer's",
            "rikostaustatote = criminal record extract (certificate)",
            "vastuulla = responsibility",
            "kuljettaja = driver",
        ],
        "simple": "The employer must order the driver's criminal record check for school and daycare transport.",
    },
    17: {
        "question": "In which of the following transports must the vehicle have an alcohol interlock?",
        "options": {
            "A": "In transport ordered by the Social Insurance Institution (Kela)",
            "B": "In school and daycare transport",
            "C": "In healthcare transport ordered under the Disability Services Act",
        },
        "keywords": [
            "alkolukko = alcohol interlock",
            "Koulu- ja päivähoitokuljetuksissa = in school and daycare transport",
            "ajoneuvo = vehicle",
            "Kansaneläkelaitos = Social Insurance Institution (Kela)",
        ],
        "simple": "An alcohol interlock is mandatory specifically in school and daycare transport.",
    },
    18: {
        "question": "How must you act if a child under 15 traveling without an adult unfastens their seat belt during the trip and refuses to fasten it?",
        "options": {
            "A": "You stop the vehicle and discuss the matter. You continue only when the child's seat belt is fastened.",
            "B": "You stop the vehicle and warn the child that you will remove them from the car unless they fasten it",
            "C": "You let the child travel without a seat belt and inform their guardian.",
        },
        "keywords": [
            "turvavyö on kiinni = seat belt is fastened",
            "alle 15-vuotias = under 15 years old",
            "Pysäytät = you stop",
            "keskustelet = you discuss",
            "irrottaa = unfastens",
        ],
        "simple": "Stop and talk to the child. Do not continue until the seat belt is properly fastened.",
    },
    19: {
        "question": "You picked up a customer at your local taxi stand. You have driven a good distance when the taxi phone rings. You notice the hands-free device was left at home. What do you do?",
        "options": {
            "A": "You answer the phone normally, apologize to the customer for the disturbance, and then answer the call.",
            "B": "I stop by the roadside so I can write down necessary information. I may keep the taxi meter running.",
            "C": "You apologize to the customer for the disturbance caused by the phone and do not answer it; you call back after the ride ends.",
        },
        "keywords": [
            "enkä vastaa = and I do not answer",
            "kyydin päätyttyä = after the ride ends",
            "handsfree-laite = hands-free device",
            "häiriö = disturbance",
            "taksimittari = taxi meter",
        ],
        "simple": "Without hands-free, do not answer while driving. Apologize and return the call after the ride.",
    },
    20: {
        "question": "Which of the following is correct regarding the phone hands-free device?",
        "options": {
            "A": "A hands-free device does not need to be used while the vehicle is moving if the call lasts less than...",
            "B": "The driver may talk on the phone using a hands-free device while the vehicle is moving if it is necessary to carry out the transport",
            "C": "If there are no customers in the taxi, the driver may talk on the phone without a hands-free device while the vehicle is moving",
        },
        "keywords": [
            "välttämätön = necessary",
            "handsfree = hands-free",
            "Kuljettaja = driver",
            "ajoneuvon liikkuessa = while the vehicle is moving",
            "kuljetus = transport",
        ],
        "simple": "While driving, phone calls are allowed only with hands-free and only when necessary for the transport.",
    },
    21: {
        "question": "What do you do when a customer in your taxi asks you to drive over the speed limit?",
        "options": {
            "A": "You tell the customer that you cannot drive over the speed limit because the set speed limit must not be exceeded.",
            "B": "You tell the customer that you can drive over the speed limit if agreed with the customer that they...",
            "C": "You tell the customer that you cannot drive over the speed limit because under traffic law speeding is allowed only in urgent medical emergencies.",
        },
        "keywords": [
            "ei saa ylittää = must not be exceeded",
            "Kerrot = you tell",
            "ylinopeus = speeding / over the speed limit",
            "nopeusrajoitus = speed limit",
            "asiakas = customer",
        ],
        "simple": "The speed limit cannot be exceeded, even if the customer asks or agrees to it.",
    },
    22: {
        "question": "There are exceptional traffic arrangements due to an accident. At the same time you receive conflicting instructions from three parties who do not know about each other. Which of the following has authority — whose instructions must you follow?",
        "options": {
            "A": "The Finnish Transport Infrastructure Agency (Liikennevirasto).",
            "B": "The police.",
            "C": "Your employer.",
        },
        "keywords": [
            "Poliisi = police",
            "määräysvalta = authority / command",
            "noudattaa = to follow",
            "ristiriitaisia = conflicting",
            "toimintaohjeita = operating instructions",
        ],
        "simple": "When official instructions conflict, the police have the highest authority on the road.",
    },
    23: {
        "question": "How must the driver take a visually impaired customer into account?",
        "options": {
            "A": "When serving a visually impaired person, it is good for the driver to speak somewhat louder.",
            "B": "The taxi driver must always guide the customer by the shoulder and help them into the car by gently pushing.",
            "C": "It is good for the taxi driver to ask the customer how they can be helped before starting to assist the customer.",
        },
        "keywords": [
            "kysyä asiakkaalta = to ask the customer",
            "näkövammainen = visually impaired",
            "Taksinkuljettaja = taxi driver",
            "auttaa = to help",
            "ennen kuin = before",
        ],
        "simple": "Always ask the visually impaired customer how they want to be helped before assisting them.",
    },
    24: {
        "question": "What special considerations must you take into account when transporting a visually impaired customer?",
        "options": {
            "A": "You require that the visually impaired customer has an assistant with them.",
            "B": "A visually impaired customer may not be aware of what happens during the transport, so they may be afraid in the taxi.",
            "C": "A visually impaired customer may not be aware of what happens during the transport, so they are not afraid in the taxi.",
        },
        "keywords": [
            "pelätä = to be afraid",
            "Asiakas = customer",
            "näkövammainen = visually impaired",
            "kuljetuksen aikana = during the transport",
            "tiedosta = be aware of",
        ],
        "simple": "A blind customer may not know what is happening during the ride and may feel anxious or afraid.",
    },
    25: {
        "question": "How should you act when you pick up a customer who moves very slowly?",
        "options": {
            "A": "I assist the customer by grabbing their arm without asking if they need help.",
            "B": "You get out of the vehicle and ask whether they need help moving or getting into the car",
            "C": "You order the customer to hurry into the car if there is very heavy traffic at the pickup point",
        },
        "keywords": [
            "tiedustelet = you ask / inquire",
            "tarvitseeko = does ... need",
            "hitaasti liikkuva = slow-moving",
            "avustan = I assist",
            "kysymättä = without asking",
        ],
        "simple": "Ask first whether the customer needs help. Do not grab or rush them without consent.",
    },
    26: {
        "question": "What do you do when a visually impaired customer has a guide dog?",
        "options": {
            "A": "You get out of the car and tell them their taxi has arrived and that the guide dog's place is in the footwell by the customer",
            "B": "You get out of the car and tell the customer their taxi has arrived and show attention to the guide dog by petting it",
            "C": "You wait in the vehicle for the customer to arrive, open the door from inside, and make room on the back seat for their guide dog.",
        },
        "keywords": [
            "opaskoira = guide dog",
            "Nouset autosta = you get out of the car",
            "jalkatila = footwell",
            "näkövammainen = visually impaired",
            "kerrot = you tell",
        ],
        "simple": "Announce your arrival, explain where the dog should go, and do not distract or pet the guide dog.",
    },
    27: {
        "question": "What is required regarding seat belt use in school transport?",
        "options": {
            "A": "Students on the back seat do not need to use seat belts",
            "B": "The driver does not need to use a seat belt",
            "C": "Seat belts must be used in transport",
        },
        "keywords": [
            "tulee käyttää turvavyötä = seat belts must be used",
            "koulukuljetus = school transport",
            "turvavyö = seat belt",
            "ei tarvitse = does not need to",
        ],
        "simple": "In school transport, everyone must use seat belts. Options saying 'does not need to' are wrong.",
    },
    28: {
        "question": "A customer with a physical disability may have a personal assistant with them. How do you act in this case?",
        "options": {
            "A": "You always speak only with the assistant",
            "B": "You always speak with the customer",
            "C": "You ask for written instructions on how to act",
        },
        "keywords": [
            "asiakkaan kanssa = with the customer",
            "avustaja = assistant",
            "liikuntavammainen = physically disabled",
            "keskustelet = you speak / discuss",
        ],
        "simple": "Always address the customer directly, not only their assistant.",
    },
    29: {
        "question": "What do you do when a customer with limited mobility has an assistant with them?",
        "options": {
            "A": "You primarily try to discuss transport-related matters with the customer",
            "B": "You primarily try to discuss transport-related matters with the assistant",
            "C": "You always ask the assistant for written instructions on how to assist the customer during transport.",
        },
        "keywords": [
            "asiakkaan kanssa = with the customer",
            "ensisijaisesti = primarily",
            "liikuntarajoitteinen = person with limited mobility",
            "avustaja = assistant",
            "kuljetukseen liittyvistä = related to the transport",
        ],
        "simple": "Discuss the ride with the customer first. The assistant supports, but the customer is the passenger.",
    },
    30: {
        "question": "How must the taxi driver act when a physically disabled customer has luggage for the cargo area and also has an assistant?",
        "options": {
            "A": "The driver assists the customer and the assistant's task is to take care of loading and unloading luggage.",
            "B": "The driver waits in the car because the assistant's job is to help the customer into the vehicle and take care of the luggage.",
            "C": "The driver assists the customer into the vehicle and takes care of loading and unloading luggage.",
        },
        "keywords": [
            "huolehtii = takes care of",
            "Kuljettaja = driver",
            "matkatavarat = luggage",
            "liikuntavammainen = physically disabled",
            "avustaja = assistant",
        ],
        "simple": "The driver helps the customer into the vehicle and handles the luggage, even if an assistant is present.",
    },
    31: {
        "question": "What do you do when a customer has an epileptic seizure during transport?",
        "options": {
            "A": "You stop the vehicle in a safe place and hold the customer tightly so they do not hurt themselves during the convulsion. When convulsions lessen, you turn the person onto their side.",
            "B": "You stop the vehicle in a safe place and make sure the customer does not hit their head, but you do not try to stop convulsive movements. When convulsions lessen, you turn the person onto their side.",
            "C": "You continue driving and hold the customer in place with one hand because epileptic...",
        },
        "keywords": [
            "Huolehdit = you make sure / take care of",
            "epileptinen kohtaus = epileptic seizure",
            "kouristus = convulsion",
            "kylkiasento = side position (recovery position)",
            "kolhi päätään = hit their head",
        ],
        "simple": "Stop safely, protect the head, do not restrain convulsions, and place the person on their side when the seizure eases.",
    },
    32: {
        "question": "An alcohol interlock is mandatory in vehicles used for school or daycare transport. It is set so that the vehicle cannot start if the driver's breath alcohol concentration is?",
        "options": {
            "A": "0.10 milligrams of alcohol per litre of breath or more.",
            "B": "0.0 milligrams per litre of breath or more.",
            "C": "Per litre of breath or more",
        },
        "keywords": [
            "alkolukko = alcohol interlock",
            "uloshengitysilma = exhaled breath",
            "alkoholipitoisuus = alcohol concentration",
            "käynnistyminen estyy = starting is prevented",
            "koulu- tai päivähoitokuljetus = school or daycare transport",
        ],
        "simple": "The interlock blocks starting at 0.10 mg/L of breath alcohol or above.",
    },
    33: {
        "question": "Helmi is a severely disabled 8-year-old girl who goes weekly for rehabilitation at a care facility. She uses a wheelchair and cannot move independently at all. Her mother has heard that Helmi would have the right to a Kela-reimbursed regular taxi with drivers employed by a private entrepreneur. Helmi's mother asks you whether this is possible. How do you answer her?",
        "options": {
            "A": "Helmi does not have the right to a regular taxi, as only elderly people and working severely disabled adults are entitled to it.",
            "B": "Helmi is entitled to a regular taxi only if her mother travels the trips with her",
            "C": "Helmi is entitled to a regular taxi.",
        },
        "keywords": [
            "vakiotaksi = regular / scheduled taxi (Kela service)",
            "vaikeavammainen = severely disabled",
            "pyörätuoli = wheelchair",
            "Kela = Finnish Social Insurance Institution",
            "oikeutettu = entitled",
        ],
        "simple": "A severely disabled child like Helmi can be entitled to Kela regular taxi transport.",
    },
    34: {
        "question": "How do you advise a customer who asks you about the right to regular taxi service for Kela-reimbursed taxi trips?",
        "options": {
            "A": "I advise the customer to call any available taxi.",
            "B": "I advise the customer to take a taxi at a taxi stand.",
            "C": "I advise the customer to call Kela's service number.",
        },
        "keywords": [
            "Neuvon = I advise",
            "palvelunumeroon = to the service number",
            "vakiotaksioikeus = right to regular taxi",
            "Kela-korvattava = Kela-reimbursed",
            "asiakas = customer",
        ],
        "simple": "Questions about Kela taxi rights should be directed to Kela's official service number.",
    },
    35: {
        "question": "What portion of a Kela ride does the customer pay to the driver?",
        "options": {
            "A": "The full price of the trip.",
            "B": "At most the deductible (own contribution).",
            "C": "The portion exceeding the deductible.",
        },
        "keywords": [
            "omavastuu = deductible / own contribution",
            "Enintään = at most",
            "KELA-kyyti = Kela ride",
            "maksaa = pays",
            "kuljettaja = driver",
        ],
        "simple": "For Kela rides, the customer pays at most their own deductible, not the full fare.",
    },
    36: {
        "question": "A customer wants a Kela-reimbursed ride, but you do not drive Kela-reimbursed rides. How do you direct the customer?",
        "options": {
            "A": "You take the customer, drive them to the destination, and ask them to apply for...",
            "B": "I advise the customer to call their local dispatch company's service number.",
            "C": "I urge the driver who drives Kela rides to contact the customer.",
        },
        "keywords": [
            "Neuvon = I advise",
            "palvelunumeroon = to the service number",
            "kelakorvattava kyyti = Kela-reimbursed ride",
            "tilausvälitysyritys = dispatch company",
            "ohjaat = you direct / guide",
        ],
        "simple": "If you do not provide Kela rides, refer the customer to the local dispatch service number.",
    },
    37: {
        "question": "Who is responsible for carefully securing the wheelchair in the taxi when the customer has a personal assistant with them?",
        "options": {
            "A": "The customer's.",
            "B": "The taxi driver's.",
            "C": "The personal assistant's.",
        },
        "keywords": [
            "Taksinkuljettaja = taxi driver",
            "pyörätuoli = wheelchair",
            "kiinnittäminen = securing / fastening",
            "henkilökohtainen avustaja = personal assistant",
            "vastuulla = responsibility",
        ],
        "simple": "Securing the wheelchair in the taxi is the taxi driver's responsibility.",
    },
    38: {
        "question": "Which of the following statements about wheelchair use and securing is true?",
        "options": {
            "A": "An electric wheelchair does not need to be secured to the vehicle.",
            "B": "The customer does not need to use the vehicle's seat belt while sitting in the wheelchair during the trip.",
            "C": "The wheelchair must be secured so that it prevents only lateral movement.",
        },
        "keywords": [
            "pyörätuoli = wheelchair",
            "kiinnittää = to secure / fasten",
            "turvavyö = seat belt",
            "sähköpyörätuoli = electric wheelchair",
            "sivusuuntainen liike = lateral movement",
        ],
        "simple": "This question tests wheelchair safety rules. The correct option reflects the applicable securing requirement in the source material.",
    },
    39: {
        "question": "Which of the following statements about wheelchair use and securing is true?",
        "options": {
            "A": "The wheelchair must be secured from its frame.",
            "B": "A wheelchair intended specifically for indoor use does not need to be secured during the trip,",
            "C": "The customer decides whether the wheelchair is secured.",
        },
        "keywords": [
            "rungosta = from the frame",
            "pyörätuoli = wheelchair",
            "kiinnittää = to secure",
            "ajon aikana = during the trip",
            "asiakas = customer",
        ],
        "simple": "A wheelchair must be secured from the frame, not left unsecured or left to the customer's choice alone.",
    },
    40: {
        "question": "Can you work as a regular taxi driver on regular rehabilitation-related trips when the passenger is a 15-year-old child using a wheelchair?",
        "options": {
            "A": "I cannot work as a regular taxi driver because the child does not have the right to regular taxi service.",
            "B": "You check with your employer whether you can work as a regular taxi driver.",
            "C": "I can work as a regular taxi driver with the guardian's authorization.",
        },
        "keywords": [
            "vakiotaksinkuljettaja = regular taxi driver",
            "pyörätuoli = wheelchair",
            "huoltajan valtuutus = guardian's authorization",
            "kuntoutus = rehabilitation",
            "Voin toimia = I can work / act",
        ],
        "simple": "A regular taxi driver may transport an entitled child on rehabilitation trips with proper guardian authorization.",
    },
    41: {
        "question": "An intoxicated customer gets into the taxi from a stand and cannot tell their address or destination. How must the driver act?",
        "options": {
            "A": "You refuse to transport them.",
            "B": "You leave the customer at the nearest stop or on the street and continue your shift.",
            "C": "You ensure the customer's safety, try to find out the destination, and if necessary call the police to the scene.",
        },
        "keywords": [
            "Huolehdit = you ensure / take care of",
            "määränpää = destination",
            "päihtynyt = intoxicated",
            "poliisi paikalle = police to the scene",
            "turvallisuus = safety",
        ],
        "simple": "Do not abandon an intoxicated passenger. Ensure safety, find the destination, and call police if needed.",
    },
    42: {
        "question": "What do you do when you are picking up a customer and they want to transfer from their wheelchair to the taxi's front seat by themselves?",
        "options": {
            "A": "You tell the customer that they may not move from the wheelchair into the vehicle without the driver's help",
            "B": "You tell the customer that they have the right to move from the wheelchair into the vehicle by themselves and assist them if necessary",
            "C": "You tell the customer that a customer arriving in a wheelchair may not sit in the front seat of the vehicle",
        },
        "keywords": [
            "itse = by themselves / independently",
            "pyörätuoli = wheelchair",
            "Totean = I state / tell",
            "avustan = I assist",
            "oikeus = right",
        ],
        "simple": "Respect the customer's autonomy. They may transfer independently, and you help only if needed.",
    },
    43: {
        "question": "Which of the following is the correct way for the driver to act when a visually impaired customer is about to enter the taxi?",
        "options": {
            "A": "You ask the customer how you can best help them and tell them which direction the vehicle is in.",
            "B": "You ask the customer how loudly you should communicate with them.",
            "C": "The driver's duties do not include taking the customer's special needs into account.",
        },
        "keywords": [
            "asiakkaalta = from / to the customer",
            "Kerrot = you tell",
            "näkövammainen = visually impaired",
            "auttaa = to help",
            "ajoneuvo = vehicle",
        ],
        "simple": "Ask how to help and describe where the vehicle is. Do not ignore special needs or just speak louder.",
    },
    44: {
        "question": "How should you act if, after the ride ends, you notice the customer has left a handbag in the vehicle?",
        "options": {
            "A": "You deliver the handbag to the police lost-and-found within one month.",
            "B": "You may wait for the customer to contact you and keep the handbag in the vehicle.",
            "C": "You deliver the handbag to the dispatch company's office as soon as possible.",
        },
        "keywords": [
            "Toimitat = you deliver",
            "toimistolle = to the office",
            "käsilaukku = handbag",
            "kyydin päätyttyä = after the ride ends",
            "tilausvälitysyritys = dispatch company",
        ],
        "simple": "Return lost property promptly through the dispatch company, not by keeping it indefinitely in the car.",
    },
    45: {
        "question": "How can the driver affect the customer's experienced travel comfort during the trip?",
        "options": {
            "A": "The driver must maintain continuous conversation with the customer.",
            "B": "The driver must be unnoticeable and silent for the entire trip.",
            "C": "The driver must have good situational awareness of the customer's needs.",
        },
        "keywords": [
            "matkustusmukavuus = travel comfort",
            "tilannetaju = situational awareness",
            "asiakkaan tarpeista = customer's needs",
            "Kuljettaja = driver",
            "keskustelu = conversation",
        ],
        "simple": "Good service means reading the customer's needs — not forcing conversation or total silence.",
    },
    46: {
        "question": "How should you act when a customer in a wheelchair wants to transfer out of the wheelchair by themselves?",
        "options": {
            "A": "The customer can never transfer without the driver's help.",
            "B": "You let the customer transfer by themselves and assist if necessary.",
            "C": "If the passenger wants to transfer into the vehicle by themselves, you may go wait in the driver's seat.",
        },
        "keywords": [
            "itse = by themselves",
            "Annat = you let / allow",
            "pyörätuoli = wheelchair",
            "avustat = you assist",
            "tarvittaessa = if necessary",
        ],
        "simple": "Allow independent transfer and offer help only when the customer needs it.",
    },
    47: {
        "question": "Which of the following is good customer service?",
        "options": {
            "A": "The driver greets politely and is ready to talk only about route-related matters",
            "B": "The driver greets politely, assesses whether the customer wants to chat, and lets the customer decide the topic.",
            "C": "Greets politely and starts a conversation on a topic they personally like.",
        },
        "keywords": [
            "päättää aiheesta = decides the topic",
            "Kuljettaja = driver",
            "Asiakas = customer",
            "kohteliaasti = politely",
            "asiakaspalvelu = customer service",
        ],
        "simple": "Greet politely and let the customer choose whether and what to talk about.",
    },
    48: {
        "question": "How must the driver act when a customer in a wheelchair has clothes caught in a way that makes sitting uncomfortable and asks for help fixing them?",
        "options": {
            "A": "It is not the driver's task to straighten the customer's clothes or otherwise...",
            "B": "The driver may only ask the customer to straighten their own clothes, because the driver may not adjust the customer's clothes even if the customer asks.",
            "C": "The driver's task is to make sure that the customer is comfortable and, if necessary, help adjust the customer's clothing.",
        },
        "keywords": [
            "varmistaa = to make sure",
            "vaatteet = clothes",
            "Kuljettaja = driver",
            "mukava = comfortable",
            "pyytää apua = asks for help",
        ],
        "simple": "The driver should help ensure the customer is comfortable, including adjusting clothes when asked.",
    },
    49: {
        "question": "What do you do in school transport when you notice you are late and conditions are such that you know you will not be able to pick up all the children?",
        "options": {
            "A": "Option 1",
            "B": "I call my employer and report the situation",
            "C": "Option 3",
        },
        "keywords": [
            "Soitan työnantajalle = I call my employer",
            "kerron tilanteesta = I report the situation",
            "koulukuljetus = school transport",
            "myöhässä = late",
            "lapsia hakemaan = to pick up the children",
        ],
        "simple": "If you cannot complete the school pickup route on time, inform your employer immediately.",
    },
    50: {
        "question": "Who is responsible for making sure the transport licence is carried along?",
        "options": {
            "A": "The taxi driver's",
            "B": "The holder of the taxi transport licence",
            "C": "No one, because carrying the licence is not required",
        },
        "keywords": [
            "Taksiliikenneluvan haltija = holder of the taxi transport licence",
            "liikennelupa = transport licence",
            "vastuu = responsibility",
            "varmistaa = to make sure",
            "Taksinkuljettaja = taxi driver",
        ],
        "simple": "The licence holder — typically the taxi company or permit holder — is responsible for ensuring the licence is available.",
    },
}


def build_explanation(q: dict, trans: dict) -> str:
    correct = q["correct"]
    lines = [f"Answer: {correct}", "", "--- English Translation ---", f"Question: {trans['question']}"]
    for opt in q["options"]:
        letter = opt["letter"]
        lines.append(f"{letter}: {trans['options'][letter]}")
    lines.extend(["", "--- Keywords ---"])
    lines.extend(trans["keywords"])
    lines.extend(["", "--- Explanation ---", trans["simple"], "", f"Correct answer: {correct}"])
    return "\n".join(lines)


def main() -> None:
    with open(ROOT / "quiz.json", encoding="utf-8") as f:
        data = json.load(f)

    output = []
    for q in data[:50]:
        qid = q["id"]
        if qid not in TRANSLATIONS:
            raise KeyError(f"Missing translation for question {qid}")
        entry = {
            "id": q["id"],
            "text": q["text"],
            "options": q["options"],
            "correct": q["correct"],
            "explanation": build_explanation(q, TRANSLATIONS[qid]),
        }
        output.append(entry)

    out_path = ROOT / "quiz_first_50_english.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Wrote {len(output)} questions to {out_path}")


if __name__ == "__main__":
    main()

Bienvenue dans notre générateur de TOP listes par l'IA, où la qualité et la pertinence sont nos priorités.
Voici quelques règles à respecter :

- Un titre accrocheur intégrant le mot-clé principal s'il est présent et un modificateur (meilleur, gratuit, etc.).

- Une description concise de 2-3 phrases mettant en avant les principaux avantages et caractéristiques de l'outil.

- Un lien vers l'outil ou une page de description détaillée.

- Évitez l'utilisation de termes génériques ou de jargon marketing excessif qui pourraient détourner l'intérêt.

- Qualité avant tout : Assurez-vous que chaque élément de la liste est pertinent, bien rédigé et en accord avec la thématique.

- Attirez l'audience : Utilisez des titres captivants et des descriptions concises pour susciter l'intérêt.

- Variez et personnalisez : Expérimentez avec différents types d'éléments dans la liste et personnalisez lorsque cela est approprié.

Optimisation SEO supplémentaire :
- Intègre des mots-clés secondaires pertinents pour ton industrie.

- Utilise des synonymes du mot-clé principal pour varier le contenu.

- Structure la liste de manière logique (par exemple, du plus populaire au moins populaire).

- Ajoute une introduction et une conclusion pour contextualiser la liste et renforcer le message principal.

Bonnes pratiques : Restez cohérent avec votre marque, gardez un ton approprié et révisez régulièrement les éléments générés.

En prenant en compte toutes ces instructions, Génèrez une liste TOP {{ $count }} des meilleurs éléments sur la thématique "{{ $thematic }}".
@if(!empty($thematic))
    @if($thematic == 'Infinidea-Image')
    Concentre-toi sur l'image pour génèrer une liste TOP {{ $count }} des meilleurs éléments".
    @else
    En prenant en compte toutes ces instructions, Génèrez une liste TOP {{ $count }} des meilleurs éléments sur la thématique "{{ $thematic }}".
    @endif
@endif

@if(!empty($tones))

Pour ce faire, adoptez les tonalités suivantes : "{{ $tones }}".
@endif
@if(!empty($segments))

Tenez compte également des cibles suivantes "{{ $segments }}".
@endif

Exemple de présentation des résultats (notez que les instructions supplémentaires entre parenthèses ne doivent pas figurer dans le résultat final, mais vous devrez les suivre) :

# TOP 1 (Ceci est un titre, mettre en gras s'il vous plaît)

Titre : (Mettre le texte du titre ici)

Description : (Mettre la brève description ici)

Un lien vers l'outil ou une page de description détaillée.

----

# TOP 2 (Ceci est un titre, mettre en gras s'il vous plaît)

Titre : (Mettre le texte du titre ici)

Description : (Mettre la brève description ici)

Un lien vers l'outil ou une page de description détaillée.

----

# TOP 3 (Ceci est un titre, mettre en gras s'il vous plaît)

Titre : (Mettre le texte du titre ici)

Description : (Mettre la brève description ici)

Un lien vers l'outil ou une page de description détaillée.

@if(!empty($language))
IMPORTANT: Please answer me in this language : "{{ $language }}".
@endif

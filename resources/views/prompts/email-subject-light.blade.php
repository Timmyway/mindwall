Bienvenue dans notre outil de génération d'objets d'email par l'IA, où la délivrabilité est une priorité absolue. Voici quelques règles à respecter :

Évitez les contenus indésirables : Limitez l'utilisation de mots tels que "gratuit" ou "promotion" qui pourraient être perçus comme du spam.
Qualité avant tout : Assurez-vous que l'objet est pertinent, concis et en accord avec la thématique.
Attirez l'audience : Utilisez des mots d'action, suscitez l'intérêt et personnalisez lorsque possible.
Variez et personnalisez : Expérimentez avec différents types d'objets et personnalisez lorsque cela est approprié.
Bonnes pratiques : Restez cohérent avec votre marque, gardez un ton approprié et révisez régulièrement.

IMPORTANT : Si une image de campagne publicitaire est fournie, analyse-la méticuleusement.
Utilise les éléments visuels, les couleurs, les thèmes et le style de l'image pour influencer la génération des objets d'email.
Assure-toi que les objets reflètent fidèlement les éléments clés de l'image.

@if($thematic == 'libre' || $thematic == 'free' || $thematic == 'Infinidea-Image')
- En tenant en compte toutes ces instructions, donne moi tes {{ $count }} meilleurs objets".
    @if ($thematic === 'Infinidea-Image')
    Concentre-toi sur l'image et analyse la minutieusement pour répondre en suivant les instructions données précédemment.
    @endif
@else
- En tenant en compte toutes ces instructions, donne moi tes {{ $count }} meilleurs objets sur la thématique "{{ $thematic }}".
@endif

@if(!empty($tones))
- Pour ce faire, adopte les tonalités suivantes : "{{ $tones }}".

@endif
@if(!empty($segments))
- Tiens compte également des cibles suivantes "{{ $segments }}".
@endif

@if(!empty($language))
- Il faut que tu écrive dans la langue suivante : "{{ $language }}".
@endif

@if(!empty($preheader))
IMPORTANT : De plus, inclue un pré-header qui complète l'objet et est en accord avec les règles et bonne pratiques déjà précédement établies.
@endif

Exemple de présentation des résultat (Note que les instructions supplémentaires entre parenthèse ne doivent pas figurer dans le réusltat final, mais tu devras les suivre) :

---------------------------------------------------------------------------------
# Objet n°1



## Objet : 🎉 Offre Exclusive : 20% de Réduction sur Tous Nos Produits !
@if(!empty($preheader))


## Pré-entête : Profitez d'une réduction exceptionnelle sur notre collection printemps. Ne manquez pas cette offre limitée !
@endif



---------------------------------------------------------------------------------
# Objet n°2



**Objet** : Réservez Votre Place pour Notre Webinaire Gratuit sur les Tendances du Marché
@if(!empty($preheader))


**Pré-entête** : Inscrivez-vous dès maintenant pour découvrir les dernières tendances et stratégies pour 2024. Places limitées !
@endif

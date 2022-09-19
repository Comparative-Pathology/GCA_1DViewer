UGLIFY	= uglifyjs
UTILS	= GCA_Utilitiesjs/GCA2DRenderer.js
VIEWER	= js/GCA3DRenderer.min.js

all:	$(LIBRARY0) $(LIBRARY1)

svg: 
		$(UGLIFY) -c -- $(SOURCES0) >$(LIBRARY0)
$(LIBRARY0):	$(SOURCES0)
		$(UGLIFY) -c -- $(SOURCES0) >$(LIBRARY0)

$(LIBRARY1):	$(SOURCES1)
		$(UGLIFY) -c -- $(SOURCES1) >$(LIBRARY1)

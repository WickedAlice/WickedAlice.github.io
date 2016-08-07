(function() {

	/* autorization part */
	$(function() {
		VK.init({
			apiId: 5550738
		});

		VK.UI.button('vk_auth');
		$('#vk_auth').on('click', autorization);
	});

	function autorization() {
		VK.Auth.login(function(response) {
			if (response.session) {
				var model = new AlbumsModel(),
					view = new AlbumsView(model),
					controller = new AlbumsController(model, view);
				model.loadAlbumsInfo(response.session.mid, response.session.user.first_name);
			}
		}, 4);
	}


	/* Object for storing data */
	function AlbumsModel() {
		this._albums = [];

		this.AllAlbumsLoaded = new Event(this);
		this.SingleAlbumLoaded = new Event(this);
	}

	AlbumsModel.prototype = {
		/* Loads main information about alboms */
		loadAlbumsInfo : function (userID, userName) {
			var that = this;
			if (this._albums .length > 0) {
				this.AllAlbumsLoaded.notify();
			} else {
				this._albums.userID = userID;
				this._albums.userName = userName;
				var aids = [ {
						name: 'profile',
						title: 'Profile photos',
						def: $.Deferred()
					}, {
						name: 'wall',
						title: 'Wall photos',
						def: $.Deferred()
					}, {
						name: 'saved',
						title: 'Saved photos',
						def: $.Deferred()
					} ];
				var def = $.Deferred();
				this.loadCustomAlboms(userID, this._albums, def);

				$.each(aids, function(i, item) {
					that.loadSystemAlboms(userID, that._albums, item, i);
				});
				$.when(def, aids[0].def, aids[1].def, aids[2].def).done(function(){
					that.AllAlbumsLoaded.notify();
				});
			}
		},

		/* Loads main information about custom albums */
		loadCustomAlboms : function (userID, _albums, def) {
			VK.Api.call('photos.getAlbums', {owner_id: userID, need_covers: 1}, function(r) {
				if (r.response) {
					r.response.forEach(function(item, i, response) {
						_albums.push(item);
					});
				}
				def.resolve();
			});
		},

		/* Loads system albums photos */
		loadSystemAlboms : function (userID, _albums, item, i) {
			VK.Api.call('photos.get', {owner_id: userID, photo_sizes: 1, album_id: item.name}, function(r) {
				if (r.response) {
					var obj = {};
					obj.photos = [];
					obj.aid = i;
					obj.title = item.title;
					obj.size = r.response.length;
					if (r.response[0]) {
						obj.updated = r.response[0].created;
						obj.thumb_src = getSizedPhoto(r.response[0], 'o');
					} else {
						obj.updated = '1000';
						obj.thumb_src = 'https://vk.com/images/m_noalbum.png';
					}
					obj.photos = r.response;
					_albums.push(obj);
				}
				item.def.resolve();
			})
		},

		/* Loads photos of custom album */
		loadSingleAlbum : function (albumID) {
			var that = this;
			var a = this.getSingleAlbum(albumID);
			if(!a.photos) {		
				a.photos = [];
				VK.Api.call('photos.get', {album_id: albumID, photo_sizes: 1}, function(r) {
					if (r.response) {
						r.response.forEach(function(item, i, response) {
							a.photos.push(item);
						});
					}
					that.SingleAlbumLoaded.notify(albumID);
				});
			} else { that.SingleAlbumLoaded.notify(albumID); }
		},

		/* Returns all albums object */
		getAlbumsList : function () {
			return this._albums;
		},

		/* Returns all photos in album */
		getSingleAlbum : function (albumID) {
			for (var i = this._albums.length - 1; i >= 0; i--) {
				if (this._albums[i].aid === albumID) {
					return this._albums[i];
				}
			}
		},

		/* Returns one photo */
		getSinglePhoto : function (albumID, photoID) {
			for (var i = this._albums.length - 1; i >= 0; i--) {
				if (this._albums[i].aid === albumID) {
					for (var j = this._albums[i].photos.length - 1; j >= 0; j--) {
						if (this._albums[i].photos[j].pid === photoID) {
							return this._albums[i].photos[j];
						}
					}
				}
			}
		}
	};


	/* Displaying data loaded to model */
	function AlbumsView(model) {
		this._model = model;

		this.showAlbumsClicked = new Event(this);
		this.showSingleAlbumClicked = new Event(this);
		this.showSinglePhotoClicked = new Event(this);

		var _this = this;

		this._model.AllAlbumsLoaded.attach(function () {
			_this.showAllAlbums();
		});
		this._model.SingleAlbumLoaded.attach(function (event, albumID) {
			_this.showSingleAlbum(albumID);
		});
		this.showSinglePhotoClicked.attach(function(event, data) {
			_this.showSinglePhoto(data.photoID, data.albumID);
		});
	}

	AlbumsView.prototype = {
		/* Displaying list of albums */
		showAllAlbums : function () {
			var albums = this._model.getAlbumsList();
			document.body.innerHTML = "";
			var albumPreviewContainer = $('<div class="album_preview_container">');

			var navPanel = $('<nav class="nav_panel">').html('Welcome, '+albums.userName+'.');
			albumPreviewContainer.append(navPanel);

			albums.forEach(function(item, i , albums) {
				this.displayAlbumPreview(item, albumPreviewContainer);
			}, this);

			$('body').append(albumPreviewContainer);
		},

		displayAlbumPreview : function (album, containerElement) {
			var that = this;

			var file;
			if (album.size === 1) { file = 'file'; }
			else { file = 'files'; }

			albumPreview = $([
				"<figure class='album_preview'>",
				"	<div class='album_thumb' style='background-image: url("+album.thumb_src+"'></div>",
				"	<div class='album_description'>",
				"		<div class='album_title'>"+album.title+"</div>",
				"		<div class='album_count'>"+album.size+" "+file+"</div>",
				"		<div class='album_date'>"+jQuery.format.prettyDate(album.updated*1000)+"</div>",
				"	</div>",
				"	<div class='album_arrow'>&raquo</div>",
				"</figure>"
			].join("\n"));

			albumPreview.click(function (id) {
				return function() {
					that.showSingleAlbumClicked.notify({ albumID : id });
				}
			}(album.aid));
			containerElement.append(albumPreview);
		},

		/* Displaying list of photos in album */
		showSingleAlbum : function (albumID) {
			document.body.innerHTML = "";
			var that = this;
			var album = this._model.getSingleAlbum(albumID);
			var singleAlbumContainer = $('<div>').addClass('single_album_container');
			$('body').append(singleAlbumContainer);

			this.showNavPanel(album.title, singleAlbumContainer, function() {
				that.showAlbumsClicked.notify();
			});

			var thumbsContainer = $('<div>').addClass('thumbs_container');
			singleAlbumContainer.append(thumbsContainer);

			for (var key in album.photos) {
				that.createImageThumb(album.photos[key], albumID);
			}

			this.thumbPositioning();
			this.repositioningTooltips();
			$(window).on('resize', function() {
				that.thumbPositioning();
				that.repositioningTooltips();
			});
		},
		createImageThumb : function (image, albumID) {
			that = this;

			var imageThumbContainer = $('<figure class="image_thumb_container">');
			var imageThumb = $('<div class="image_thumb">').css('background-image', 'url('+getSizedPhoto(image, 'o')+')');
			imageThumbContainer.append(imageThumb);

			if (image.text) {
				var tooltip = this.createTooltip(image.text, imageThumbContainer);
				imageThumbContainer.append(tooltip);
			}

			var selectButton = $([
				"	<span class='select_button'>",
				"		<span class='select_button_check_mark'>✔</span>",
				"		<span class='select_button_text'>Select</span>",
				"	</span>"
			].join("\n"));
			selectButton.click(function() {
				that.showSinglePhotoClicked.notify({ photoID: image.pid, albumID: albumID});
			});

			imageThumbContainer.append(selectButton);
			$('.thumbs_container').append(imageThumbContainer);
		},

		thumbPositioning : function () {
			w = $('.thumbs_container').width();
			col = Math.round(w/102)-1;
			t = (w-102*col)/col/2;
			$('.image_thumb_container').css('margin', '5px '+t+'px');
		},

		createTooltip : function (text, container) {
			var tooltip = $([
				"	<div class='tooltip_container'>",
				"		<span class='tooltip_field_name'>Description:&nbsp</span>",
				"		<span class='tooltip_field_content'>"+text+"</span>",
				"	</div>"
			].join("\n"));
			this.calculateTooltipWidth(tooltip, container);
			return tooltip;
		},

		calculateTooltipWidth: function (tooltip, container) {
			var a = $('<div class = hidden_tooltip>');
			$('body').append(tooltip);
			tooltip.width(tooltip.width());
			tooltip.remove();
		},

		repositioningTooltips : function () {
			var w = $(window).width();
			$.each($('.tooltip_container'), function(i, val) {
				val = $(val);
				if ((val.offset().left + val.width())> w) {
					val.addClass('tooltip_right');
				} else {
					val.removeClass('tooltip_right');
				}
			});
		},

		/* Displaying single photo */
		showSinglePhoto : function (photoID, albumID) {
			document.body.innerHTML = "";
			var that = this;
			var photo = this._model.getSinglePhoto(albumID, photoID);
			var singlePhotoContainer = $('<div class="single_photo_container">')
			this.showNavPanel(photoID, singlePhotoContainer, function() {
				that.showSingleAlbumClicked.notify({albumID: albumID});
			});

			singlePhotoContainer.append($('<img>').attr('src', getSizedPhoto(photo)));

			if (photo.text) {
				singlePhotoContainer.append($([
					"	<div class='single_photo_description'>",
					"		<span>Description: </span>",
					"		<span>"+photo.text+"</span>",
					"	</div>"
				].join("\n")));		
			}

			$('body').append(singlePhotoContainer);
		},

		/* Displaying navigation for albums list and single photo pages */
		showNavPanel : function (title, container, backButtonEvent) {
			var albumListButton = $('<div class="album_list_button">').html('&lt;'); 
			albumListButton.click(backButtonEvent);

			var albumTitle = $('<div class="album_title">').html(title);
			
			container.append(
				$('<nav class="nav_panel underline">')
				.append(albumListButton)
				.append(albumTitle)
			);
		}
	};


	/* Attaching model to view */
	function AlbumsController(model, view) {
		this._model = model;
		this._view = view;

		var _this = this;

		this.showAlbumsClicked = new Event(this);
		this.showSingleAlbumClicked = new Event(this);

		this._view.showAlbumsClicked.attach(function (sender, args) {
			_this.showAllAlbums();
		});

		this._view.showSingleAlbumClicked.attach(function (sender, args) {
			_this.showSingleAlbum(args.albumID);
		});
	}

	AlbumsController.prototype = {
		showAllAlbums : function () {
			this._model.loadAlbumsInfo();
		},
		showSingleAlbum : function (albumID) {
			this._model.loadSingleAlbum(albumID);
		}
	};


	/* Returns photo of a needed size */
	function getSizedPhoto (photo, size) {
		if (size) {
			for (var i = photo.sizes.length - 1; i >= 0; i--) {
				if (photo.sizes[i].type == size) return photo.sizes[i].src;
			}
		}

		var sizes = ['x', 'y', 'z', 'w']
		var w = $(window).width();

		if (w > 2600) {
			size = 3;
		} else if (w > 1300) {
			size = 2;
		} else if (w > 820) {
			size = 1;
		} else {
			size = 0;
		}

		for (var i = photo.sizes.length - 1; i >= 0; i--) {
			for (var j = size; j >= 0; j--) {
				if (photo.sizes[i].type === sizes[j]) return photo.sizes[i].src;
			}
		}
		return photo.src;
	}


	/* Obsever object */
	function Event(sender) {
		this._sender = sender;
		this._listeners = [];
	}

	Event.prototype = {
		attach : function (listener) {
			this._listeners.push(listener);
		},
		notify : function (args) {
			var index;
			for (index = 0; index < this._listeners.length; index += 1) {
				this._listeners[index](this._sender, args);
			}
		}
	};

})();
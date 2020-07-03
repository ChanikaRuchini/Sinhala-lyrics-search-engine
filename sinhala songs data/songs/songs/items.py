# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy

class SongItem(scrapy.Item):
    title = scrapy.Field()
    artist = scrapy.Field()
    genre = scrapy.Field()
    writer = scrapy.Field()
    music = scrapy.Field()
    lyrics = scrapy.Field()
    visits = scrapy.Field()
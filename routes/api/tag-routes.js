const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint
router.get('/', (req, res) => {
  // find all tags
  
   Tag.findAll({
      include: [
        {
          model: Product,
          through: ProductTag,
        },
      ]
    })
    .then(data => res.status(200).json(data))
  .catch (err => res.status(500).json(err))
  // be sure to include its associated Product data
});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  try {
    const tagData =  Tag.findByPk({
      include: [
        Category, {model: Product, through: ProductTag},
      ]
    }, req.params.id);

    if (!tagData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
  // be sure to include its associated Product data
});

router.post('/', (req, res) => {
  // create a new tag
  req.body(
    {
      tag_name: "Basketball",
      tagIds: [1, 2, 3]
    },
    {
      tag_name: "Baseball",
      tagIds: [4, 5, 6, 7, 8, 9]
    },
    {
      tag_name: "Football",
      price: 20.00,
      stock: 2,
      tagIds: [10, 11]
    },
    {
      tag_name: "Soccerball",
      tagIds: [12, 13, 14, 15, 16]
    },
    {
      tag_name: "Volleyball",
      tagIds: [17]
    },
  );
  Tag.create(req.body)
    .then((tag) => {
      if (req.body.tagIds.length) {
        const tagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            tag_id: tag.id,
            tag_id,
          };
        });
        return Tag.bulkCreate(tagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(tag);
    })
    .then((tagIds) => res.status(200).json(tagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((Tags) => {
      // find all associated tags from ProductTag
      return Tags.findAll({ where: { tagIds: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagData =  Tag.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

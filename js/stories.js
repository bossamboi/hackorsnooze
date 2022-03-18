"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  let starStyle = "";

  if (currentUser) {
    const isFavorite = currentUser.favorites.some(function (favorite) {
      return favorite.storyId === story.storyId;
    });
    starStyle = isFavorite ? "fas fa-star" : "far fa-star";
  }

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <i class = "${starStyle}"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function putFavoritesOnHTML() {
  $favStoriesList.empty();

  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favStoriesList.append($story);
  }

  if (currentUser.favorites.length === 0) {
    $favStoriesList.text("You haven't favorited anything yet!");
  }
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Takes values from new story form and adds story to API and DOM */

async function storySubmit(evt) {
  console.debug("storySubmit", evt);
  evt.preventDefault();

  const author = $("#author").val();
  const title = $("#title").val();
  const url = $("#url").val();

  const newStory = await storyList.addStory(currentUser, { title, author, url });
  console.log("newStory=", newStory);
  const newStoryMarkup = generateStoryMarkup(newStory);
  $allStoriesList.prepend(newStoryMarkup);
  // DOM.prepend new Story markup

  // hide the form jQuery
  $submitForm.hide();

  //research form reset - possible jquery method for forms

  $("#author").val("");
  $("#title").val("");
  $("#url").val("");
}

$submitForm.on("submit", storySubmit);

/**if the star is unfavorited, change star to solid and add story to favorites
 * if the star is favorited, change the star to outlined and remove from favorites
 */
async function handleStarClick(evt) {
  let $starElement = $(evt.target);
  let $currentStoryId = $starElement.closest("li").attr("id");
  if ($starElement.hasClass("far")) {
    await currentUser.addFavorite($currentStoryId);
  } else {
    await currentUser.removeFavorite($currentStoryId);
  }
  $starElement.toggleClass("fas far");
}

$("ol").on("click", ".fa-star", handleStarClick);
$("ul").on("click", ".fa-star", handleStarClick);

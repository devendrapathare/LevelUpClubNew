// check-posts.js
// Script to check if there are posts in the database and test the API endpoint

const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function checkPosts() {
  try {
    // Check how many posts exist
    const postCount = await prisma.post.count();
    console.log('Total posts in database:', postCount);
    
    if (postCount === 0) {
      console.log('No posts found in database');
      return;
    }
    
    // Get a sample post
    const samplePost = await prisma.post.findFirst({
      include: {
        user: true
      }
    });
    
    console.log('Sample post:', JSON.stringify(samplePost, null, 2));
    
    // Get posts for a specific user (if any exist)
    if (samplePost) {
      const userPosts = await prisma.post.findMany({
        where: {
          user_id: samplePost.user_id
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              headline: true,
              profile_picture_url: true,
              profile_picture_data: true
            }
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profile_picture_url: true,
                  profile_picture_data: true
                }
              }
            }
          },
          likes: {
            select: {
              id: true,
              user_id: true
            }
          }
        }
      });
      
      console.log('User posts count:', userPosts.length);
      console.log('First user post:', JSON.stringify(userPosts[0], null, 2));
    }
  } catch (error) {
    console.error('Error checking posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPosts();